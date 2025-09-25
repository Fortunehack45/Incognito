import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { firestore } from '@/firebase/server-init';

// This type is used server-side, keep it here.
export type Question = {
  id: string;
  toUserId: string;
  questionText: string;
  answerText: string | null;
  isAnswered: boolean;
  createdAt: Date | Timestamp;
  answeredAt: Date | Timestamp | null;
};


const questionsCollection = collection(firestore, 'questions');

export async function getQuestionsForUser(userId: string): Promise<Question[]> {
  const q = query(questionsCollection, where('toUserId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      answeredAt: data.answeredAt?.toDate(),
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
  return {
    id: questionDoc.id,
    ...data,
    createdAt: data.createdAt?.toDate(),
    answeredAt: data.answeredAt?.toDate(),
  } as Question;
}
