import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";

admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

const sanitize = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const normalizePhone = (value: unknown) => sanitize(value).replace(/\s+/g, "").replace(/-/g, "");

const ensureRole = (request: { auth?: { token?: Record<string, unknown> } }) => String(request.auth?.token?.role || "");
const assertAdmin = (request: { auth?: { token?: Record<string, unknown> } }) => {
  const role = ensureRole(request);
  if (!["SUPER_ADMIN", "MID_ADMIN"].includes(role)) {
    throw new HttpsError("permission-denied", "Admin access required.");
  }
};

const hasAnyUsers = async () => {
  const snap = await db.collection("users").limit(1).get();
  return !snap.empty;
};

export const bootstrapFirstAdmin = onCall(async request => {
  const alreadyExists = await hasAnyUsers();
  if (alreadyExists) {
    throw new HttpsError("failed-precondition", "An administrator already exists.");
  }

  const { name, email, phone = "", password, avatar = "", location = "", workDetails = "" } = request.data || {};
  if (!name || !email || !password) {
    throw new HttpsError("invalid-argument", "Missing administrator details.");
  }

  const user = await auth.createUser({
    displayName: sanitize(name),
    email: sanitize(email),
    password: sanitize(password),
    photoURL: sanitize(avatar) || undefined,
  });

  await auth.setCustomUserClaims(user.uid, { role: "SUPER_ADMIN" });

  await db.collection("users").doc(user.uid).set({
    id: user.uid,
    name: sanitize(name),
    email: sanitize(email).toLowerCase(),
    phone: sanitize(phone),
    phoneNormalized: normalizePhone(phone),
    role: "SUPER_ADMIN",
    avatar: sanitize(avatar),
    location: sanitize(location),
    workDetails: sanitize(workDetails),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, id: user.uid };
});

export const createPortalUser = onCall(async request => {
  assertAdmin(request);

  const { name, email, phone = "", role, password, avatar = "", location = "", workDetails = "" } = request.data || {};
  if (!email || !password || !name || !role) {
    throw new HttpsError("invalid-argument", "Missing user fields.");
  }

  const user = await auth.createUser({
    displayName: sanitize(name),
    email: sanitize(email),
    password: sanitize(password),
    photoURL: sanitize(avatar) || undefined,
  });

  await auth.setCustomUserClaims(user.uid, { role: sanitize(role) });

  await db.collection("users").doc(user.uid).set({
    id: user.uid,
    name: sanitize(name),
    email: sanitize(email).toLowerCase(),
    phone: sanitize(phone),
    phoneNormalized: normalizePhone(phone),
    role: sanitize(role),
    avatar: sanitize(avatar),
    location: sanitize(location),
    workDetails: sanitize(workDetails),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, id: user.uid };
});

export const updatePortalUser = onCall(async request => {
  assertAdmin(request);

  const { id, name, email, phone = "", role, avatar = "", location = "", workDetails = "", password } = request.data || {};
  if (!id) throw new HttpsError("invalid-argument", "Missing user id.");

  const payload: Record<string, unknown> = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (name !== undefined) payload.name = sanitize(name);
  if (email !== undefined) payload.email = sanitize(email).toLowerCase();
  if (phone !== undefined) {
    payload.phone = sanitize(phone);
    payload.phoneNormalized = normalizePhone(phone);
  }
  if (role !== undefined) payload.role = sanitize(role);
  if (avatar !== undefined) payload.avatar = sanitize(avatar);
  if (location !== undefined) payload.location = sanitize(location);
  if (workDetails !== undefined) payload.workDetails = sanitize(workDetails);

  await db.collection("users").doc(String(id)).set(payload, { merge: true });

  const authUpdates: Record<string, unknown> = {};
  if (email !== undefined) authUpdates.email = sanitize(email).toLowerCase();
  if (name !== undefined) authUpdates.displayName = sanitize(name);
  if (avatar !== undefined) authUpdates.photoURL = sanitize(avatar) || null;
  if (Object.keys(authUpdates).length) {
    await auth.updateUser(String(id), authUpdates);
  }
  if (role !== undefined) {
    await auth.setCustomUserClaims(String(id), { role: sanitize(role) });
  }
  if (password) {
    await auth.updateUser(String(id), { password: sanitize(password) });
  }

  return { success: true };
});

export const deletePortalUser = onCall(async request => {
  assertAdmin(request);
  const id = request.data?.id;
  if (!id) throw new HttpsError("invalid-argument", "Missing user id.");
  await Promise.all([
    auth.deleteUser(String(id)),
    db.collection("users").doc(String(id)).delete(),
  ]);
  return { success: true };
});

export const resetPortalPassword = onCall(async request => {
  assertAdmin(request);
  const { id, password } = request.data || {};
  if (!id || !password) throw new HttpsError("invalid-argument", "Missing password reset details.");
  await auth.updateUser(String(id), { password: sanitize(password) });
  return { success: true };
});
