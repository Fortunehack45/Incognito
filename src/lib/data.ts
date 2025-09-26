
'use server';

import type { Question, User } from './types';
import { firestore } from '@/firebase/admin';

const questionsCollection = firestore.collection('questions');

export async function getQuestionsForUser(userId: string): Promise<Question[]> {
  const q = questionsCollection.where('toUserId', '==', userId).orderBy('createdAt', 'desc');
  const querySnapshot = await q.get();
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    const createdAt = data.createdAt.toDate();
    const answeredAt = data.answeredAt ? data.answeredAt.toDate() : null;
    return {
      id: doc.id,
      ...data,
      createdAt,
      answeredAt,
    } as Question;
  });
}

export async function getQuestionById(questionId: string): Promise<Question | undefined> {
  const questionDocRef = questionsCollection.doc(questionId);
  const questionDoc = await questionDocRef.get();
  if (!questionDoc.exists) {
    return undefined;
  }
  const data = questionDoc.data();
  // Firestore admin SDK returns Timestamps, so we convert them to Dates
  if (data) {
    const createdAt = data.createdAt.toDate();
    const answeredAt = data.answeredAt ? data.answeredAt.toDate() : null;
    return {
      id: questionDoc.id,
      ...data,
      createdAt,
      answeredAt,
    } as Question;
  }
  return undefined;
}


// Helper function to get user by ID, useful for revalidation
export async function getUserById(userId: string): Promise<User | null> {
    try {
        const userDoc = await firestore.collection('users').doc(userId).get();
        if (!userDoc.exists) return null;
        // Important: We need to return a plain object, not a Firestore document
        const data = userDoc.data();
        if (!data) return null;
        return {
            id: userDoc.id,
            username: data.username,
            email: data.email,
            bio: data.bio || null,
            createdAt: data.createdAt, // This will be a Timestamp
            isModerationEnabled: data.isModerationEnabled || false,
        } as User;
    } catch (error) {
        console.error("Failed to get user by ID", error);
        return null;
    }
}
