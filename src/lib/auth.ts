'use server';

import { cookies } from 'next/headers';
import { getUserById, type User } from '@/lib/data';

const SESSION_COOKIE_NAME = 'qa_hub_session';

export async function createSession(userId: string) {
  cookies().set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });
}

export async function getAuthenticatedUser(): Promise<User | undefined> {
  const userId = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!userId) {
    return undefined;
  }

  try {
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
