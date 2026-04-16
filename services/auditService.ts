import { addDoc, collection } from 'firebase/firestore';
import { authService } from './authService';
import { db, isFirebaseConfigured } from './firebase';

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'upload' | 'password_reset' | 'settings';

export type AuditEvent = {
  action: AuditAction;
  entity: string;
  entityId?: string;
  label?: string;
  before?: unknown;
  after?: unknown;
  note?: string;
};

export const recordAuditEvent = async (event: AuditEvent) => {
  if (!isFirebaseConfigured || !db) return;

  const actor = authService.getCurrentUser();
  try {
    await addDoc(collection(db, 'auditLogs'), {
      ...event,
      actorId: actor?.id || '',
      actorName: actor?.name || 'System',
      actorRole: actor?.role || 'GUEST',
      createdAt: new Date().toISOString(),
    });
  } catch {
    // Audit logging should never block the user flow.
  }
};
