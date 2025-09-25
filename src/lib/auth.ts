'use server';

import { Timestamp } from 'firebase/firestore';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from './constants';
import { getUserById } from './data';

// This type is now defined directly in the auth file
export type User = {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  createdAt: Date | Timestamp;
};

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

export async function getAuthenticatedUser(): Promise<User | undefined> {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return undefined;
  }

  try {
    const { userId } = JSON.parse(sessionCookie);
    if (!userId) return undefined;
    
    // In a real app, you'd use the Admin SDK to verify the token.
    // For this starter, we'll trust the userId in the cookie.
    const user = await getUserById(userId);
    return user;

  } catch (error) {
    console.error("Error getting authenticated user:", error);
    return undefined;
  }
}
