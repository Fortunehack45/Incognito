'use client';
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
import { getFirestore } from 'firebase/firestore';
import type { User, Question } from './types';
import { initializeFirebase } from '@/firebase';

const { firestore } = initializeFirebase();

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

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const q = query(usersCollection, where('email', '==', email));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return undefined;
  }
  const userDoc = querySnapshot.docs[0];
  return { id: userDoc.id, ...userDoc.data() } as User;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const userDoc = await getDoc(doc(usersCollection, id));
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

export async function addQuestion(toUserId: string, questionText: string): Promise<Question> {
  const newQuestionData = {
    toUserId,
    questionText,
    answerText: null,
    isAnswered: false,
    createdAt: serverTimestamp(),
    answeredAt: null,
  };
  const docRef = await addDoc(questionsCollection, newQuestionData);
  
  // We don't have the server timestamp locally, so we return a Question with a local date for now.
  // The component will get the real date from the Firestore listener.
  return {
    id: docRef.id,
    ...newQuestionData,
    createdAt: new Date(),
  } as Question;
}

export async function answerQuestion(questionId: string, answerText: string): Promise<Question | undefined> {
  const questionRef = doc(questionsCollection, questionId);
  await setDoc(questionRef, {
    answerText,
    isAnswered: true,
    answeredAt: serverTimestamp(),
  }, { merge: true });

  const questionDoc = await getDoc(questionRef);
  if (!questionDoc.exists()) return undefined;

  const data = questionDoc.data();
  return {
    id: questionDoc.id,
    ...data,
    createdAt: data.createdAt?.toDate(),
    answeredAt: new Date(), // Local approximation
  } as Question;
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await deleteDoc(doc(questionsCollection, questionId));
}

export async function addUser(details: Omit<User, 'id' | 'createdAt' | 'bio'> & { id: string }): Promise<User> {
  const { id, ...rest } = details;
  const newUser: Omit<User, 'id'> = {
    ...rest,
    bio: null,
    createdAt: new Date(), // This will be converted to a server timestamp if needed.
  };
  await setDoc(doc(usersCollection, id), newUser);
  return { id, ...newUser };
}

export async function getQuestionById(questionId: string): Promise<Question | undefined> {
  const questionDoc = await getDoc(doc(questionsCollection, questionId));
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
