import {
  getIdTokenResult,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
  type User as FirebaseAuthUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';
import { createAuthUser } from './authApi';
import { portalFunctions } from './portalFunctions';
import { startPrivateListeners } from './mockData';
import { recordAuditEvent } from './auditService';
import { User, UserRole } from '../types';

const PROFILE_COLLECTION = 'users';

const normalizePhone = (value: string) => value.replace(/\s+/g, '').replace(/-/g, '').trim();
const stripPassword = (user: User): User => {
  const { password, ...rest } = user;
  return rest as User;
};

type PortalUserDoc = User & {
  phoneNormalized?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: 'Active' | 'Disabled';
};

let currentUser: User | null = null;
let ready = false;
let readyResolvers: Array<() => void> = [];

const resolveReady = () => {
  if (ready) return;
  ready = true;
  readyResolvers.splice(0).forEach(resolve => resolve());
};

const persistSession = (user: User | null) => {
  currentUser = user;
};

const parseRole = (value: unknown): UserRole | null => {
  const role = String(value || '');
  return (Object.values(UserRole) as string[]).includes(role) ? (role as UserRole) : null;
};

const loadProfileByUid = async (uid: string): Promise<PortalUserDoc | null> => {
  if (!db || !isFirebaseConfigured) return null;
  const snap = await getDoc(doc(db, PROFILE_COLLECTION, uid));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<PortalUserDoc, 'id'>) }) : null;
};

const saveProfile = async (profile: User, extra: Record<string, unknown> = {}) => {
  if (!db || !isFirebaseConfigured) return;
  const payload: Record<string, unknown> = {
    ...profile,
    ...extra,
    phoneNormalized: normalizePhone(profile.phone || ''),
    updatedAt: new Date().toISOString(),
  };

  if (extra.createdAt !== undefined) {
    payload.createdAt = extra.createdAt;
  }

  await setDoc(doc(db, PROFILE_COLLECTION, profile.id), payload, { merge: true });
};

const syncSessionToFirestore = async (firebaseUser: FirebaseAuthUser, profile?: Partial<User>) => {
  if (!db || !isFirebaseConfigured) {
    return null;
  }

  const existing = await loadProfileByUid(firebaseUser.uid).catch(() => null);
  const roleFromClaim = await (async () => {
    try {
      const token = await getIdTokenResult(firebaseUser, true);
      return parseRole(token.claims.role);
    } catch {
      return null;
    }
  })();

  const resolvedRole = roleFromClaim ?? existing?.role ?? profile?.role ?? UserRole.VOLUNTEER;
  const merged: User = {
    id: firebaseUser.uid,
    name: profile?.name || existing?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Portal User',
    email: profile?.email || existing?.email || firebaseUser.email || '',
    phone: profile?.phone || existing?.phone || '',
    role: resolvedRole,
    avatar: profile?.avatar || existing?.avatar || firebaseUser.photoURL || '',
    location: profile?.location || existing?.location || '',
    workDetails: profile?.workDetails || existing?.workDetails || '',
    status: existing?.status || 'Active',
  };

  if (merged.status === 'Disabled') {
    await signOut(auth!);
    persistSession(null);
    return null;
  }

  await saveProfile(merged, existing?.createdAt !== undefined ? { createdAt: existing.createdAt } : { createdAt: new Date().toISOString() });
  persistSession(stripPassword(merged));
  return merged;
};

export const authService = {
  subscribe: (callback: (user: User | null) => void) => {
    if (!auth || !isFirebaseConfigured) {
      callback(null);
      resolveReady();
      return () => undefined;
    }

    return onAuthStateChanged(auth, async firebaseUser => {
      if (!firebaseUser) {
        if (currentUser) {
          void recordAuditEvent({ action: 'logout', entity: 'auth', entityId: currentUser.id, label: currentUser.email });
        }
        persistSession(null);
        callback(null);
        resolveReady();
        return;
      }

      const profile = await syncSessionToFirestore(firebaseUser);
      if (profile && [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN].includes(profile.role)) {
        startPrivateListeners(profile.role);
      }
      callback(profile ? stripPassword(profile) : null);
      resolveReady();
    });
  },

  whenReady: () => {
    if (ready) return Promise.resolve();
    return new Promise<void>(resolve => readyResolvers.push(resolve));
  },

  login: async (identifier: string, password: string): Promise<User | null> => {
    if (!auth || !isFirebaseConfigured) {
      throw new Error('Firebase authentication is required to sign in.');
    }

    const email = identifier.toLowerCase().trim();
    if (!email.includes('@')) {
      throw new Error('Use your email address to sign in.');
    }

    const credential = await signInWithEmailAndPassword(auth, email, password);
    const profile = await syncSessionToFirestore(credential.user);
    if (!profile) {
      throw new Error('This account has been disabled. Please contact your administrator.');
    }
    void recordAuditEvent({ action: 'login', entity: 'auth', entityId: profile.id, label: profile.email });
    if ([UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN].includes(profile.role)) {
      startPrivateListeners(profile.role);
    }
    return stripPassword(profile);
  },

  registerUser: async (user: User & { password?: string }) => {
    if (!user.password || user.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    return authService.createUserAccount(user as User & { password: string });
  },

  createUserAccount: async (user: User & { password: string }) => {
    if (!user.password || user.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    if (!isFirebaseConfigured || !auth || !db) {
      throw new Error('Firebase is required to create accounts.');
    }

    const targetRole = user.role || UserRole.VOLUNTEER;
    const privilegedRoles = [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN];

    if (privilegedRoles.includes(targetRole)) {
      await portalFunctions.createPortalUser({
        name: user.name.trim(),
        email: user.email.trim().toLowerCase(),
        phone: user.phone || '',
        role: targetRole,
        password: user.password,
        avatar: user.avatar || '',
        location: user.location || '',
        workDetails: user.workDetails || '',
      });
      return null;
    }

    const created = await createAuthUser({
      email: user.email.trim().toLowerCase(),
      password: user.password,
      displayName: user.name.trim(),
      photoURL: user.avatar || '',
    });
    const uid = created.localId;
    const profile: User = {
      id: uid,
      name: user.name.trim(),
      email: user.email.trim().toLowerCase(),
      phone: user.phone || '',
      role: targetRole,
      avatar: user.avatar || '',
      location: user.location || '',
      workDetails: user.workDetails || '',
      status: 'Active',
    };
    await saveProfile(profile, { createdAt: new Date().toISOString() });
    persistSession(stripPassword(profile));
    void recordAuditEvent({ action: 'create', entity: 'user', entityId: profile.id, label: profile.email });
    return stripPassword(profile);
  },

  logout: async () => {
    if (currentUser) {
      void recordAuditEvent({ action: 'logout', entity: 'auth', entityId: currentUser.id, label: currentUser.email });
    }
    persistSession(null);
    if (auth && isFirebaseConfigured) {
      await signOut(auth);
    }
  },

  getCurrentUser: (): User | null => currentUser,

  updateCurrentUser: async (updatedUser: User) => {
    if (!currentUser) throw new Error('No active session found.');

    const next: User = {
      ...currentUser,
      ...updatedUser,
      role: currentUser.role,
      status: currentUser.status || 'Active',
    };

    persistSession(stripPassword(next));
    void recordAuditEvent({ action: 'update', entity: 'user', entityId: next.id, label: next.email, after: next });

    if (auth && isFirebaseConfigured && auth.currentUser) {
      if (next.email && next.email !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, next.email);
      }
      await updateProfile(auth.currentUser, {
        displayName: next.name,
        photoURL: next.avatar || undefined,
      });
      await saveProfile(next);
    }

    return stripPassword(next);
  },

  updatePassword: async (newPassword: string) => {
    if (!auth?.currentUser) throw new Error('No active session found.');
    await updatePassword(auth.currentUser, newPassword);
  },

  sendPasswordReset: async (identifier: string) => {
    if (!auth || !isFirebaseConfigured) {
      return;
    }
    const email = identifier.toLowerCase().trim();
    if (!email.includes('@')) {
      throw new Error('Enter the email address for the account. Password reset uses email.');
    }
    await sendPasswordResetEmail(auth, email);
  },

  isAuthenticated: (): boolean => Boolean(currentUser),

  hasAccess: (allowedRoles: UserRole[]): boolean => {
    const user = authService.getCurrentUser();
    return !!user && allowedRoles.includes(user.role);
  },
};
