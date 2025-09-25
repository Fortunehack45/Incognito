'use client';
import { ReactNode, useEffect, useState } from 'react';
import { FirebaseProvider } from './provider';

// This provider ensures Firebase is initialized only once on the client
// and prevents hydration mismatches.
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null; // Or a loading spinner
    }

    return <FirebaseProvider>{children}</FirebaseProvider>;
}
