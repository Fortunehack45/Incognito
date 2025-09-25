'use client';
import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { useFirestore } from '../provider';

export function useDoc<T>(docPath: string) {
    const firestore = useFirestore();
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);

    const memoizedDocRef = useMemo(() => {
        if (!firestore || !docPath) return null;
        return doc(firestore, docPath)
    }, [firestore, docPath]);

    useEffect(() => {
        if (!memoizedDocRef) {
            setLoading(false);
            return;
        };

        const unsubscribe = onSnapshot(
            memoizedDocRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    setData({ id: docSnapshot.id, ...docSnapshot.data() } as T);
                } else {
                    setData(null);
                }
                setLoading(false);
            },
            (err) => {
                console.error(`Error fetching doc ${docPath}:`, err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [memoizedDocRef, docPath]);

    return { data, loading };
}
