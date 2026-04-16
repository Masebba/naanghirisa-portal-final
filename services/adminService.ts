import { httpsCallable } from 'firebase/functions';
import { ensureFirebase, functions } from './firebase';
import { UserProfile } from '../types';

type CreateUserPayload = {
  email: string;
  password: string;
  name: string;
  role: string;
  phone?: string;
  avatar?: string;
  location?: string;
  workDetails?: string;
};

export async function createUserAccount(payload: CreateUserPayload) {
  const { functions } = ensureFirebase();
  const callable = httpsCallable<CreateUserPayload, { uid: string }>(functions, 'createUserAccount');
  const result = await callable(payload);
  return result.data;
}

export async function updateUserRole(uid: string, role: string) {
  const { functions } = ensureFirebase();
  const callable = httpsCallable<{ uid: string; role: string }, { ok: true }>(functions, 'updateUserRole');
  return callable({ uid, role });
}

export async function deleteUserAccount(uid: string) {
  const { functions } = ensureFirebase();
  const callable = httpsCallable<{ uid: string }, { ok: true }>(functions, 'deleteUserAccount');
  return callable({ uid });
}

export async function resetUserPassword(email: string) {
  const { functions } = ensureFirebase();
  const callable = httpsCallable<{ email: string }, { ok: true }>(functions, 'resetUserPassword');
  return callable({ email });
}