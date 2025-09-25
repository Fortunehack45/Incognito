import { cookies } from 'next/headers';
import { getUserById, type User } from '@/lib/data';
import 'server-only';

const SESSION_COOKIE_NAME = 'qa_hub_session';

export async function createSession(userId: string, idToken: string) {
  cookies().set(SESSION_COOKIE_NAME, JSON.stringify({ userId, idToken }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });
}

export async function getAuthenticatedUser(): Promise<User | undefined> {
  const session = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!session) {
    return undefined;
  }

  try {
    const { userId } = JSON.parse(session);
    if (!userId) return undefined;
    // In a production app, you'd use the Firebase Admin SDK to verify the idToken
    const user = await getUserById(userId);
    return user;
  } catch (error) {
    console.error('Failed to fetch authenticated user', error);
    return undefined;
  }
}

export async function clearSession() {
  cookies().delete(SESSION_COOKIE_NAME);
}

export async function getSessionToken() {
    const session = cookies().get(SESSION_COOKIE_NAME)?.value;
    if (!session) return null;
    try {
        const { idToken } = JSON.parse(session);
        return idToken;
    } catch {
        return null;
    }
}
