import { doc, getDoc, setDoc } from 'firebase/firestore';
import { authService } from './authService';
import { portalFunctions } from './portalFunctions';
import { db, isFirebaseConfigured } from './firebase';
import { User, UserRole } from '../types';
import { recordAuditEvent } from './auditService';

const normalizePhone = (value?: string) => (value || '').replace(/\s+/g, '').replace(/-/g, '').trim();

const saveUserDoc = async (user: User & { status?: 'Active' | 'Disabled' }) => {
  if (!db || !isFirebaseConfigured) {
    throw new Error('Firebase is not configured.');
  }

  const now = new Date().toISOString();
  const existingSnap = await getDoc(doc(db, 'users', user.id));
  const existingData = existingSnap.exists() ? (existingSnap.data() as Partial<User & { createdAt?: string }>) : null;

  await setDoc(
    doc(db, 'users', user.id),
    {
      ...user,
      phoneNormalized: normalizePhone(user.phone),
      updatedAt: now,
      createdAt: existingData?.createdAt || now,
    },
    { merge: true },
  );
};

export const userAdminService = {
  createUser: async (user: User & { password: string }) => {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase is not configured.');
    }

    if (!user.password || user.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    if (![UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN, UserRole.DONOR, UserRole.VOLUNTEER].includes(user.role)) {
      throw new Error('Select a valid role.');
    }

    const result = await portalFunctions.createPortalUser({
      name: user.name,
      email: user.email.trim().toLowerCase(),
      phone: user.phone || '',
      role: user.role,
      password: user.password,
      avatar: user.avatar || '',
      location: user.location || '',
      workDetails: user.workDetails || '',
    });
    void recordAuditEvent({ action: 'create', entity: 'user', label: user.email, after: user });
    return result;
  },

  updateUser: async (user: User & { password?: string }) => {
    const existing = authService.getCurrentUser();
    if (user.password) {
      throw new Error('Password changes must use the reset password action.');
    }

    if (!user.id) {
      throw new Error('Missing user id.');
    }

    if (existing && existing.id === user.id) {
      const result = await authService.updateCurrentUser({
        ...existing,
        name: user.name,
        phone: user.phone || '',
        avatar: user.avatar || '',
        location: user.location || '',
        workDetails: user.workDetails || '',
        role: existing.role,
      });
      void recordAuditEvent({ action: 'update', entity: 'user', entityId: user.id, label: user.email, after: user });
      return { success: true };
    }

    if (!db || !isFirebaseConfigured) {
      throw new Error('Firebase is not configured.');
    }

    const currentDoc = authService.getCurrentUser();
    const storedSnap = await getDoc(doc(db, 'users', user.id));
    const storedData = storedSnap.exists() ? (storedSnap.data() as User) : null;
    const incomingEmail = user.email.trim().toLowerCase();
    const storedEmail = (storedData?.email || '').trim().toLowerCase();

    if (currentDoc?.id !== user.id && storedEmail && storedEmail !== incomingEmail) {
      throw new Error('Email updates are not supported from the dashboard. Create a replacement account instead.');
    }

    const result = await portalFunctions.updatePortalUser({
      id: user.id,
      name: user.name,
      email: currentDoc?.id === user.id ? incomingEmail : storedEmail || incomingEmail,
      phone: user.phone || '',
      role: user.role,
      avatar: user.avatar || '',
      location: user.location || '',
      workDetails: user.workDetails || '',
    });
    void recordAuditEvent({ action: 'update', entity: 'user', entityId: user.id, label: user.email, after: user });
    return result;
  },

  deleteUser: async (id: string) => {
    if (!db || !isFirebaseConfigured) {
      throw new Error('Firebase is not configured.');
    }

    const current = authService.getCurrentUser();
    if (current?.id === id) {
      throw new Error('You cannot disable your own active session from here.');
    }

    const result = await portalFunctions.deletePortalUser({ id });
    void recordAuditEvent({ action: 'delete', entity: 'user', entityId: id, label: current?.email || id });
    return result;
  },

  resetPassword: async (id: string) => {
    if (!db || !isFirebaseConfigured) {
      throw new Error('Firebase is not configured.');
    }

    const { getDoc } = await import('firebase/firestore');
    const usersSnap = await getDoc(doc(db, 'users', id));
    if (!usersSnap.exists()) {
      throw new Error('User profile not found.');
    }
    const data = usersSnap.data() as User;
    if (!data.email) {
      throw new Error('User email not found.');
    }

    await authService.sendPasswordReset(data.email);
    void recordAuditEvent({ action: 'password_reset', entity: 'user', entityId: id, label: data.email });
    return { success: true };
  },
};
