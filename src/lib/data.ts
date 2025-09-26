
'use server';

import type { Question } from './types';
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
