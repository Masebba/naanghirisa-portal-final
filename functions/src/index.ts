import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";

admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

const sanitize = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const normalizePhone = (value: unknown) => sanitize(value).replace(/\s+/g, "").replace(/-/g, "");

const ALLOWED_ROLES = ["SUPER_ADMIN", "MID_ADMIN", "STAFF_ADMIN", "DONOR", "VOLUNTEER"] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

const ensureRole = (request: { auth?: { token?: Record<string, unknown> } }) => String(request.auth?.token?.role || "");
const assertAdmin = (request: { auth?: { token?: Record<string, unknown> } }) => {
  const role = ensureRole(request);
  if (!['SUPER_ADMIN', 'MID_ADMIN', 'STAFF_ADMIN'].includes(role)) {
    throw new HttpsError("permission-denied", "Admin access required.");
  }
};

const requireString = (value: unknown, field: string) => {
  const trimmed = sanitize(value);
  if (!trimmed) throw new HttpsError("invalid-argument", `Missing ${field}.`);
  return trimmed;
};

const requireRole = (value: unknown) => {
  const role = sanitize(value) as AllowedRole;
  if (!ALLOWED_ROLES.includes(role)) {
    throw new HttpsError("invalid-argument", "Invalid role.");
  }
  return role;
};

const hasAnyUsers = async () => {
  const snap = await db.collection("users").limit(1).get();
  return !snap.empty;
};

const writeProfile = async (userId: string, profile: Record<string, unknown>) => {
  await db.collection("users").doc(userId).set({
    ...profile,
    id: userId,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
};

const writeAuditLog = async (payload: Record<string, unknown>) => {
  await db.collection("auditLogs").add({
    ...payload,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
};

export const bootstrapFirstAdmin = onCall(async request => {
  const alreadyExists = await hasAnyUsers();
  if (alreadyExists) {
    throw new HttpsError("failed-precondition", "An administrator already exists.");
  }

  const name = requireString(request.data?.name, "administrator name");
  const email = requireString(request.data?.email, "administrator email").toLowerCase();
  const password = requireString(request.data?.password, "password");
  const phone = sanitize(request.data?.phone);
  const avatar = sanitize(request.data?.avatar);
  const location = sanitize(request.data?.location);
  const workDetails = sanitize(request.data?.workDetails);

  const user = await auth.createUser({
    displayName: name,
    email,
    password,
    photoURL: avatar || undefined,
  });

  await auth.setCustomUserClaims(user.uid, { role: "SUPER_ADMIN" });

  await writeProfile(user.uid, {
    name,
    email,
    phone,
    phoneNormalized: normalizePhone(phone),
    role: "SUPER_ADMIN",
    avatar,
    location,
    workDetails,
    status: "Active",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await writeAuditLog({ action: "create", entity: "user", entityId: user.uid, actorRole: "SYSTEM", label: email });
  return { success: true, id: user.uid };
});

export const createPortalUser = onCall(async request => {
  assertAdmin(request);

  const name = requireString(request.data?.name || request.data?.displayName, "name");
  const email = requireString(request.data?.email, "email").toLowerCase();
  const password = requireString(request.data?.password, "password");
  const phone = sanitize(request.data?.phone);
  const role = requireRole(request.data?.role);
  const avatar = sanitize(request.data?.avatar || request.data?.photoURL);
  const location = sanitize(request.data?.location);
  const workDetails = sanitize(request.data?.workDetails);

  const user = await auth.createUser({
    displayName: name,
    email,
    password,
    photoURL: avatar || undefined,
  });

  await auth.setCustomUserClaims(user.uid, { role });

  await writeProfile(user.uid, {
    name,
    email,
    phone,
    phoneNormalized: normalizePhone(phone),
    role,
    avatar,
    location,
    workDetails,
    status: "Active",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await writeAuditLog({ action: "create", entity: "user", entityId: user.uid, actorRole: "SYSTEM", label: email });
  return { success: true, id: user.uid };
});

export const updatePortalUser = onCall(async request => {
  assertAdmin(request);

  const id = requireString(request.data?.id, "user id");
  const payload: Record<string, unknown> = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (request.data?.name !== undefined || request.data?.displayName !== undefined) {
    payload.name = requireString(request.data?.name || request.data?.displayName, "name");
  }
  if (request.data?.email !== undefined) {
    payload.email = requireString(request.data?.email, "email").toLowerCase();
  }
  if (request.data?.phone !== undefined) {
    const phone = sanitize(request.data?.phone);
    payload.phone = phone;
    payload.phoneNormalized = normalizePhone(phone);
  }
  if (request.data?.role !== undefined) {
    payload.role = requireRole(request.data?.role);
  }
  if (request.data?.avatar !== undefined || request.data?.photoURL !== undefined) {
    payload.avatar = sanitize(request.data?.avatar || request.data?.photoURL);
  }
  if (request.data?.location !== undefined) {
    payload.location = sanitize(request.data?.location);
  }
  if (request.data?.workDetails !== undefined) {
    payload.workDetails = sanitize(request.data?.workDetails);
  }
  if (request.data?.status !== undefined) {
    payload.status = sanitize(request.data?.status);
  }

  await db.collection("users").doc(id).set(payload, { merge: true });
  await writeAuditLog({ action: "update", entity: "user", entityId: id, actorRole: ensureRole(request), label: payload.email || payload.name || id, after: payload });

  const authUpdates: Record<string, unknown> = {};
  if (payload.email !== undefined) authUpdates.email = payload.email;
  if (payload.name !== undefined) authUpdates.displayName = payload.name;
  if (payload.avatar !== undefined) authUpdates.photoURL = payload.avatar || null;
  if (Object.keys(authUpdates).length) {
    await auth.updateUser(id, authUpdates);
  }
  if (payload.role !== undefined) {
    await auth.setCustomUserClaims(id, { role: payload.role });
  }
  if (request.data?.password) {
    await auth.updateUser(id, { password: requireString(request.data.password, "password") });
  }

  return { success: true };
});

export const deletePortalUser = onCall(async request => {
  assertAdmin(request);
  const id = requireString(request.data?.id, "user id");
  await Promise.all([
    auth.updateUser(id, { disabled: true }),
    db.collection("users").doc(id).set({
      status: "Disabled",
      disabledAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true }),
  ]);
  await writeAuditLog({ action: "delete", entity: "user", entityId: id, actorRole: ensureRole(request), label: id });
  return { success: true };
});

export const resetPortalPassword = onCall(async request => {
  assertAdmin(request);
  const id = requireString(request.data?.id, "user id");
  const password = requireString(request.data?.password, "password");
  await auth.updateUser(id, { password });
  await writeAuditLog({ action: "password_reset", entity: "user", entityId: id, actorRole: ensureRole(request), label: id });
  return { success: true };
});
