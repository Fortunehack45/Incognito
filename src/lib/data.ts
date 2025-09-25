'use server';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from '@/lib/auth'; // Use the initialized firestore from auth
import type { Question } from './types';

const questionsCollection = collection(firestore, 'questions');

export async function getQuestionsForUser(userId: string): Promise<Question[]> {
  const q = query(questionsCollection, where('toUserId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
    const answeredAt = data.answeredAt instanceof Timestamp ? data.answeredAt.toDate() : null;
    return {
      id: doc.id,
      ...data,
      createdAt,
      answeredAt,
    } as Question;
  });
}

export async function getQuestionById(questionId: string): Promise<Question | undefined> {
  const questionDocRef = doc(questionsCollection, questionId);
  const questionDoc = await getDoc(questionDocRef);
  if (!questionDoc.exists()) {
    return undefined;
  }
  const data = questionDoc.data();
  const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
  const answeredAt = data.answeredAt instanceof Timestamp ? data.answeredAt.toDate() : null;
  return {
    id: questionDoc.id,
    ...data,
    createdAt,
    answeredAt,
  } as Question;
}
