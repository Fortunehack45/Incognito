'use server';

import type { User } from './types';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
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
