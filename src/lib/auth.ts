import { cookies } from 'next/headers';
import { Timestamp } from 'firebase/firestore';

export type User = {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  createdAt: Date | Timestamp;
};

export const SESSION_COOKIE_NAME = 'qa_hub_session';

export async function createSession(userId: string, idToken: string) {
  cookies().set(SESSION_COOKIE_NAME, JSON.stringify({ userId, idToken }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });
}

export async function clearSession() {
  cookies().delete(SESSION_COOKIE_NAME);
}
