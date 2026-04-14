import { firebaseApiKey } from './firebase';

type CreateAuthUserArgs = {
  email: string;
  password: string;
  displayName?: string;
  photoURL?: string;
};

type AuthApiResponse = {
  localId: string;
  idToken?: string;
  refreshToken?: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
};

const authEndpoint = (method: string) => `https://identitytoolkit.googleapis.com/v1/accounts:${method}?key=${firebaseApiKey}`;

const requestJson = async <T>(url: string, body: Record<string, unknown>): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMessage = payload?.error?.message || 'Firebase Auth request failed.';
    throw new Error(errorMessage.replaceAll('_', ' ').toLowerCase());
  }

  return payload as T;
};

export const createAuthUser = async ({ email, password, displayName, photoURL }: CreateAuthUserArgs) => {
  const created = await requestJson<AuthApiResponse>(authEndpoint('signUp'), {
    email,
    password,
    returnSecureToken: true,
  });

  if (created.idToken && (displayName || photoURL)) {
    await requestJson(authEndpoint('update'), {
      idToken: created.idToken,
      displayName: displayName || undefined,
      photoUrl: photoURL || undefined,
      returnSecureToken: true,
    });
  }

  return created;
};

export const updateOwnAuthProfile = async (idToken: string, payload: { email?: string; displayName?: string; photoURL?: string }) => {
  return requestJson(authEndpoint('update'), {
    idToken,
    email: payload.email,
    displayName: payload.displayName,
    photoUrl: payload.photoURL,
    returnSecureToken: true,
  });
};
