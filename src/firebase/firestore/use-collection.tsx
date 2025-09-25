'use client';
import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, query, collection, where, orderBy, type Query, Timestamp } from 'firebase/firestore';
import { useFirestore } from '../provider';
import type { Question } from '@/lib/types';


export function useCollection<T extends Question>(collectionPath: string, options?: {
    where?: [string, any, any];
    orderBy?: [string, 'asc' | 'desc'];
}) {
    const firestore = useFirestore();
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const memoizedQuery = useMemo(() => {
        if (!firestore) return null;
        let q: Query = collection(firestore, collectionPath);
        if (options?.where) {
            q = query(q, where(...options.where));
        }
        if (options?.orderBy) {
            q = query(q, orderBy(...options.orderBy));
        }
        return q;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firestore, collectionPath, JSON.stringify(options?.where), JSON.stringify(options?.orderBy)]);


    useEffect(() => {
        if (!memoizedQuery) {
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(
            memoizedQuery,
            (querySnapshot) => {
                const docs = querySnapshot.docs.map(doc => {
                    const docData = doc.data();
                    // Manually convert Timestamps to Dates
                    const createdAt = docData.createdAt instanceof Timestamp ? docData.createdAt.toDate() : docData.createdAt;
                    const answeredAt = docData.answeredAt instanceof Timestamp ? docData.answeredAt.toDate() : docData.answeredAt;
                    return { id: doc.id, ...docData, createdAt, answeredAt } as T;
                });
                setData(docs);
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error(`Error fetching collection ${collectionPath}:`, err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [memoizedQuery, collectionPath]);

    return { data, loading, error };
}
