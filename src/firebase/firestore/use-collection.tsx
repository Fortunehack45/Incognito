'use client';
import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, query, collection, where, orderBy, type Query } from 'firebase/firestore';
import { useFirestore } from '../provider';

export function useCollection<T>(collectionPath: string, options?: {
    where?: [string, any, any];
    orderBy?: [string, 'asc' | 'desc'];
}) {
    const firestore = useFirestore();
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const memoizedQuery = useMemo(() => {
        let q: Query = collection(firestore, collectionPath);
        if (options?.where) {
            q = query(q, where(...options.where));
        }
        if (options?.orderBy) {
            q = query(q, orderBy(...options.orderBy));
        }
        return q;
    }, [firestore, collectionPath, options?.where, options?.orderBy]);


    useEffect(() => {
        const unsubscribe = onSnapshot(
            memoizedQuery,
            (querySnapshot) => {
                const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
                setData(docs);
                setLoading(false);
            },
            (err) => {
                console.error(err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [memoizedQuery]);

    return { data, loading, error };
}
