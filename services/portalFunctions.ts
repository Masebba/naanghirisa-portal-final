import { getFunctions, httpsCallable } from 'firebase/functions';
import { app, isFirebaseConfigured } from './firebase';

type CallableResult<T> = { data: T };

const call = async <T>(name: string, data?: Record<string, unknown>): Promise<T> => {
  if (!isFirebaseConfigured || !app) {
    throw new Error('Firebase is not configured.');
  }

  const functions = getFunctions(app);
  const fn = httpsCallable<Record<string, unknown> | undefined, T>(functions, name);
  const result = await fn(data);
  return (result as CallableResult<T>).data;
};

export const portalFunctions = {
  bootstrapFirstAdmin: (data: Record<string, unknown>) => call<{ success: true; id: string }>('bootstrapFirstAdmin', data),
  createPortalUser: (data: Record<string, unknown>) => call<{ success: true; id: string }>('createPortalUser', data),
  updatePortalUser: (data: Record<string, unknown>) => call<{ success: true }>('updatePortalUser', data),
  deletePortalUser: (data: Record<string, unknown>) => call<{ success: true }>('deletePortalUser', data),
  resetPortalPassword: (data: Record<string, unknown>) => call<{ success: true }>('resetPortalPassword', data),
};
