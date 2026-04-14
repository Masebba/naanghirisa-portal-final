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
import { startPrivateListeners } from './mockData';
import { User, UserRole } from '../types';

const AUTH_KEY = 'naanghirisa_session';
const PROFILE_COLLECTION = 'users';
const BOOTSTRAP_COLLECTION = 'system';
const BOOTSTRAP_DOC = 'bootstrap';

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

export type BootstrapStatus = {
  completed: boolean;
  superAdminEmail?: string;
  superAdminUid?: string;
  createdAt?: string;
  updatedAt?: string;
  note?: string;
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
  if (typeof window === 'undefined') return;
  if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  else localStorage.removeItem(AUTH_KEY);
};

const hydrateFromStorage = () => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
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
  await setDoc(
    doc(db, PROFILE_COLLECTION, profile.id),
    {
      ...profile,
      ...extra,
      phoneNormalized: normalizePhone(profile.phone || ''),
      updatedAt: new Date().toISOString(),
      createdAt: extra.createdAt || new Date().toISOString(),
    },
    { merge: true },
  );
};

const syncSessionToFirestore = async (firebaseUser: FirebaseAuthUser, profile?: Partial<User>) => {
  if (!db || !isFirebaseConfigured) {
    const fallback = hydrateFromStorage();
    if (fallback) persistSession(fallback);
    return fallback;
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

  await saveProfile(merged, { createdAt: existing?.createdAt || new Date().toISOString() });
  persistSession(stripPassword(merged));
  return merged;
};

const signInAfterBootstrap = async (email: string, password: string) => {
  if (!auth) throw new Error('Authentication is not available.');
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await syncSessionToFirestore(credential.user);
  return profile ? stripPassword(profile) : null;
};

const localStorageOnlyLogin = async (identifier: string, password: string) => {
  const fallback = hydrateFromStorage();
  if (fallback && fallback.email.toLowerCase() === identifier.toLowerCase().trim() && password.length >= 8) {
    persistSession(fallback);
    return fallback;
  }
  return null;
};

export const authService = {
  subscribe: (callback: (user: User | null) => void) => {
    if (typeof window !== 'undefined' && !currentUser) {
      const storageUser = hydrateFromStorage();
      if (storageUser) persistSession(storageUser);
    }

    if (!auth || !isFirebaseConfigured) {
      callback(currentUser || hydrateFromStorage());
      resolveReady();
      return () => undefined;
    }

    return onAuthStateChanged(auth, async firebaseUser => {
      if (!firebaseUser) {
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
      return localStorageOnlyLogin(identifier, password);
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
    if ([UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN].includes(profile.role)) {
      startPrivateListeners(profile.role);
    }
    return stripPassword(profile);
  },

  bootstrapInitialAdmin: async (user: User & { password: string }) => {
    if (!user.password || user.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    if (!isFirebaseConfigured || !auth || !db) {
      const fallback = hydrateFromStorage();
      if (fallback) throw new Error('Firebase is required for production admin bootstrap.');
      throw new Error('Firebase is not configured.');
    }

    const status = await authService.getBootstrapStatus();
    if (status.completed) {
      throw new Error('An administrator already exists.');
    }

    const created = await createAuthUser({
      email: user.email.trim().toLowerCase(),
      password: user.password,
      displayName: user.name.trim(),
      photoURL: user.avatar || '',
    });

    const uid = created.localId;
    const email = user.email.trim().toLowerCase();

    await signInWithEmailAndPassword(auth, email, user.password);

    const adminProfile: User = {
      id: uid,
      name: user.name.trim(),
      email,
      phone: user.phone || '',
      role: UserRole.SUPER_ADMIN,
      avatar: user.avatar || '',
      location: user.location || '',
      workDetails: user.workDetails || '',
      status: 'Active',
    };

    await saveProfile(adminProfile, { createdAt: new Date().toISOString() });
    await setDoc(doc(db, BOOTSTRAP_COLLECTION, BOOTSTRAP_DOC), {
      completed: true,
      superAdminEmail: adminProfile.email,
      superAdminUid: uid,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      source: 'spark-rest-bootstrap',
    }, { merge: true });

    persistSession(adminProfile);
    return stripPassword(adminProfile);
  },

  registerUser: async (user: User & { password?: string }) => {
    if (!user.password || user.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    return authService.bootstrapInitialAdmin(user as User & { password: string });
  },

  getBootstrapStatus: async (): Promise<BootstrapStatus> => {
    if (!db || !isFirebaseConfigured) {
      return { completed: false, note: 'firebase-not-configured' };
    }

    try {
      const snap = await getDoc(doc(db, BOOTSTRAP_COLLECTION, BOOTSTRAP_DOC));
      if (!snap.exists()) {
        return { completed: false };
      }
      const data = snap.data() as Partial<BootstrapStatus> & { source?: string };
      return {
        completed: Boolean(data.completed),
        superAdminEmail: data.superAdminEmail,
        superAdminUid: data.superAdminUid,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        note: data.source || undefined,
      };
    } catch (error) {
      console.warn('Unable to read bootstrap status from Firestore.', error);
      return { completed: false, note: 'read-failed' };
    }
  },

  logout: async () => {
    persistSession(null);
    if (auth && isFirebaseConfigured) {
      await signOut(auth);
    }
  },

  getCurrentUser: (): User | null => currentUser || (isFirebaseConfigured ? currentUser : hydrateFromStorage()),

  updateCurrentUser: async (updatedUser: User) => {
    if (!currentUser) throw new Error('No active session found.');

    const next: User = {
      ...currentUser,
      ...updatedUser,
      role: currentUser.role,
      status: currentUser.status || 'Active',
    };

    persistSession(stripPassword(next));

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

  isAuthenticated: (): boolean => Boolean(currentUser || (!isFirebaseConfigured && hydrateFromStorage())),

  hasAccess: (allowedRoles: UserRole[]): boolean => {
    const user = authService.getCurrentUser();
    return !!user && allowedRoles.includes(user.role);
  },
};

if (typeof window !== 'undefined') {
  authService.subscribe(user => {
    if (user) persistSession(user);
  });
}
