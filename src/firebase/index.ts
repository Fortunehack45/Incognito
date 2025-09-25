// This file is the CLIENT-SIDE entry point for Firebase.
// It should not be used on the server.
'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// --- LAZY INITIALIZATION ---
// We will hold the instances in a variable, but only initialize them once.
let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

function initializeFirebase() {
  if (!firebaseApp) {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApp();
    }
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  }
  
  // We've already checked for nullability, so we can safely cast.
  return {
    firebaseApp: firebaseApp as FirebaseApp,
    auth: auth as Auth,
    firestore: firestore as Firestore,
  };
}


// --- EXPORTS ---
export { initializeFirebase };
export { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useAuth } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
