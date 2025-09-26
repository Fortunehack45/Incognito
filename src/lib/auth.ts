'use server';

import type { User } from './types';
import { firestore } from '@/firebase/admin';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';


export async function getUserById(id: string): Promise<User | undefined> {
  // This function uses the admin SDK and is intended for server-side use only.
  const userDocRef = firestore.collection('users').doc(id);
  const userDoc = await userDocRef.get();
  if (!userDoc.exists) {
    return undefined;
  }
  return { id: userDoc.id, ...userDoc.data() } as User;
}

/**
 * Fetches a user profile from Firestore by their username using the CLIENT-SIDE SDK.
 * This function is intended to be called from client components.
 * @param username The username to look for.
 * @returns A user object or undefined if not found.
 */
export async function getUserByUsername(username: string): Promise<User | undefined> {
    // IMPORTANT: This function is now designed for the client.
    // It uses the regular 'firebase/firestore' not 'firebase-admin'.
    // We cannot use the 'useFirestore' hook here as this is not a component.
    // So we must get the instance from the provider manually.
    const { getFirestore } = await import('firebase/firestore');
    const { initializeFirebase } = await import('@/firebase/init');
    const { firestore: clientFirestore } = initializeFirebase();

    const usersCollection = collection(clientFirestore, 'users');
    const q = query(usersCollection, where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return undefined;
    }
    
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as User;
}