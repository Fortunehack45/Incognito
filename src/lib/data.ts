import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import type { User, Question } from './types';
import { firestore } from '@/firebase/server-init';

const usersCollection = collection(firestore, 'users');
const questionsCollection = collection(firestore, 'questions');

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const q = query(usersCollection, where('username', '==', username));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return undefined;
  }
  const userDoc = querySnapshot.docs[0];
  return { id: userDoc.id, ...userDoc.data() } as User;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const userDocRef = doc(usersCollection, id);
  const userDoc = await getDoc(userDocRef);
  if (!userDoc.exists()) {
    return undefined;
  }
  return { id: userDoc.id, ...userDoc.data() } as User;
}

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
