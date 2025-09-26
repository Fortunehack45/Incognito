'use client';
import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, query, collection, where, orderBy, type Query, Timestamp } from 'firebase/firestore';
import { useFirestore } from '../provider';


export function useCollection<T>(collectionPath: string | null, options?: {
    where?: [string, any, any];
    orderBy?: [string, 'asc' | 'desc'];
}) {
    const firestore = useFirestore();
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Memoize the query to prevent re-creating it on every render
    const memoizedQuery = useMemo(() => {
        if (!firestore || !collectionPath) return null;
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
        // If there's no query (e.g., user logged out), reset state and do nothing.
        if (!memoizedQuery) {
            setData([]);
            setLoading(false);
            return;
        }
        
        setLoading(true);
        const unsubscribe = onSnapshot(
            memoizedQuery,
            (querySnapshot) => {
                const docs = querySnapshot.docs.map(doc => {
                    const docData = doc.data();
                    // Manually convert Timestamps to Dates for serializability
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

        // Cleanup function to unsubscribe from the listener when the component unmounts or query changes
        return () => unsubscribe();
    }, [memoizedQuery, collectionPath]);

    return { data, loading, error };
}
