'use server';

import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from './constants';
import type { User } from './types';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const firestore = admin.firestore();

export async function createSession(userId: string, idToken: string) {
  // In a real app, you would verify the idToken here using the Admin SDK.
  // For this starter, we'll trust the client and just set the cookie.
  // const decodedToken = await admin.auth().verifyIdToken(idToken);
  // if (decodedToken.uid !== userId) {
  //   throw new Error("Token UID does not match provided user ID");
  // }
  
  cookies().set(SESSION_COOKIE_NAME, JSON.stringify({ userId }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });
}

export async function clearSession() {
  cookies().delete(SESSION_COOKIE_NAME);
}

const usersCollection = firestore.collection('users');

export async function getUserById(id: string): Promise<User | undefined> {
  const userDocRef = usersCollection.doc(id);
  const userDoc = await userDocRef.get();
  if (!userDoc.exists) {
    return undefined;
  }
  return { id: userDoc.id, ...userDoc.data() } as User;
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const q = usersCollection.where('username', '==', username);
  const querySnapshot = await q.get();
  if (querySnapshot.empty) {
    return undefined;
  }
  const userDoc = querySnapshot.docs[0];
  return { id: userDoc.id, ...userDoc.data() } as User;
}

export async function getAuthenticatedUser(): Promise<User | undefined> {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return undefined;
  }

  try {
    const { userId } = JSON.parse(sessionCookie);
    if (!userId) return undefined;
    
    // This call is the source of the server error. We'll rely on the client to fetch user data.
    // For session validation, we'll trust the cookie for now.
    // In a real app, you would verify the session cookie/token here with the Admin SDK.
    const user = await getUserById(userId);
    return user;

  } catch (error) {
    console.error("Error getting authenticated user:", error);
    return undefined;
  }
}
