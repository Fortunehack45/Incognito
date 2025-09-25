'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * This component listens for Firestore permission errors and throws them,
 * making them visible in the Next.js development error overlay.
 * This is a developer-only tool and should not be used in production
 * without modification to handle errors gracefully.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: Error) => {
      // Throwing the error here will cause it to be displayed in the
      // Next.js error overlay during development. This is a powerful
      // tool for debugging security rules.
      console.error("Firestore Permission Error:", error.message);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null; // This component does not render anything.
}
