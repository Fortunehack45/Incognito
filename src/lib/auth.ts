
'use client';

import type { User } from './types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/init';

/**
 * Fetches a user profile from Firestore by their username using the CLIENT-SIDE SDK.
 * This function is intended to be called from client components.
 * @param username The username to look for.
 * @returns A user object or undefined if not found.
 */
export async function getUserByUsername(username: string): Promise<User | undefined> {
    // IMPORTANT: This function is designed for the client.
    // It uses the regular 'firebase/firestore' not 'firebase-admin'.
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
