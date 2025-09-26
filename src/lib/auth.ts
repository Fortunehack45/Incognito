'use server';

import type { User } from './types';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Use application default credentials in a deployed environment
    admin.initializeApp();
  } catch (error: any) {
    // In a development environment with hot-reloading, the app can sometimes be initialized more than once.
    // We can safely ignore this error.
    if (error.code !== 'auth/invalid-credential' && process.env.NODE_ENV === 'development') {
      console.warn('Firebase admin initialization error in development. This is likely safe to ignore with hot-reloading.');
    } else if (process.env.NODE_ENV !== 'development') {
       console.error('Firebase admin initialization error', error);
    }
  }
}


const firestore = admin.firestore();

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
