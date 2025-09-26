import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // In a deployed environment, the SDK will automatically discover credentials.
    // For local development, you need to set up service account credentials.
    // See: https://firebase.google.com/docs/admin/setup
    admin.initializeApp();
  } catch (error: any) {
    // In a development environment with hot-reloading, the app can sometimes
    // be initialized more than once. We can safely ignore this error.
    if (error.code !== 'auth/invalid-credential' && process.env.NODE_ENV === 'development') {
      console.warn('Firebase admin initialization error in development. This is likely safe to ignore with hot-reloading.');
    } else if (process.env.NODE_ENV !== 'development') {
       console.error('Firebase admin initialization error', error);
    }
  }
}

export const firestore = admin.firestore();
