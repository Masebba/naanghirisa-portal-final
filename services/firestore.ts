import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  serverTimestamp,
  type DocumentData,
  type Firestore,
  type QueryConstraint,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

export const collectionNames = {
  content: 'site',
  users: 'users',
  programs: 'programs',
  campaigns: 'campaigns',
  news: 'news',
  leaders: 'leaders',
  donations: 'donations',
  volunteers: 'volunteerApplications',
  feedback: 'feedback',
  expenditures: 'expenditures',
  incomes: 'income',
  settings: 'settings',
} as const;

export type CollectionName = keyof typeof collectionNames;

const dbOrThrow = (): Firestore => {
  if (!db || !isFirebaseConfigured) throw new Error('Firebase is not configured.');
  return db;
};

export async function getDocument<T extends DocumentData>(collectionName: CollectionName, id: string): Promise<T | null> {
  const snapshot = await getDoc(doc(dbOrThrow(), collectionNames[collectionName], id));
  return snapshot.exists() ? (snapshot.data() as T) : null;
}

export async function upsertDocument<T extends DocumentData>(collectionName: CollectionName, id: string, data: T) {
  await setDoc(doc(dbOrThrow(), collectionNames[collectionName], id), data, { merge: true });
}

export async function patchDocument<T extends DocumentData>(collectionName: CollectionName, id: string, data: Partial<T>) {
  await updateDoc(doc(dbOrThrow(), collectionNames[collectionName], id), data as Record<string, unknown>);
}

export async function deleteDocument(collectionName: CollectionName, id: string) {
  await deleteDoc(doc(dbOrThrow(), collectionNames[collectionName], id));
}

export async function listDocuments<T extends DocumentData>(
  collectionName: CollectionName,
  constraints: QueryConstraint[] = [],
): Promise<Array<T & { id: string }>> {
  const snap = await getDocs(query(collection(dbOrThrow(), collectionNames[collectionName]), ...constraints));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as T) })) as Array<T & { id: string }>;
}

export function subscribeCollection<T extends DocumentData>(
  collectionName: CollectionName,
  callback: (items: Array<T & { id: string }>) => void,
  constraints: QueryConstraint[] = [],
) {
  if (!db || !isFirebaseConfigured) {
    callback([]);
    return () => undefined;
  }
  return onSnapshot(query(collection(db, collectionNames[collectionName]), ...constraints), snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...(d.data() as T) })) as Array<T & { id: string }>);
  });
}

export function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

export const serverNow = serverTimestamp;