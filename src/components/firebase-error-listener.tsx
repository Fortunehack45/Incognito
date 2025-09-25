'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import type { FirestorePermissionError } from '@/firebase/errors';

/**
 * This component listens for Firestore permission errors and throws them,
 * making them visible in the Next.js development error overlay.
 * This is a developer-only tool and should not be used in production
 * without modification to handle errors gracefully.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // Throwing the error here will cause it to be displayed in the
      // Next.js error overlay during development. This is a powerful
      // tool for debugging security rules.
      throw error;
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null; // This component does not render anything.
}
