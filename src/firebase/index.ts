// This file is the CLIENT-SIDE entry point for Firebase.
// It should not be used on the server.
'use client';

// --- EXPORTS ---
export { initializeFirebase } from './init';
export { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useAuth } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
