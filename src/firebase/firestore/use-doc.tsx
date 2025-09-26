'use client';
import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { useFirestore } from '../provider';

export function useDoc<T>(docPath: string | null) {
    const firestore = useFirestore();
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const memoizedDocRef = useMemo(() => {
        if (!firestore || !docPath) return null;
        return doc(firestore, docPath)
    }, [firestore, docPath]);

    useEffect(() => {
        // If the path is null or empty (e.g., logged-out user), reset state and do nothing.
        if (!memoizedDocRef) {
            setData(null);
            setLoading(false);
            return;
        };

        setLoading(true);
        const unsubscribe = onSnapshot(
            memoizedDocRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    setData({ id: docSnapshot.id, ...docSnapshot.data() } as T);
                } else {
                    setData(null);
                }
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error(`Error fetching doc ${docPath}:`, err);
                setError(err);
                setLoading(false);
            }
        );

        // Cleanup function to unsubscribe from the listener when the component unmounts or path changes
        return () => unsubscribe();
    }, [memoizedDocRef, docPath]);

    return { data, loading, error };
}
