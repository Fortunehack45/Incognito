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
  initializeApp,
  getApps,
  getApp,
  getFirestore,
} from 'firebase/firestore';
import type { User, Question } from './types';
import { firebaseConfig } from '@/firebase/config';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Initialize Firebase for SERVER-SIDE use only
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);

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
  const userDocRef = doc(usersCollection, id);
  try {
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      return undefined;
    }
    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch (serverError) {
    const permissionError = new FirestorePermissionError({
        path: userDocRef.path,
        operation: 'get',
    });
    errorEmitter.emit('permission-error', permissionError);
    return undefined;
  }
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
  
  const questionRef = await addDoc(questionsCollection, newQuestionData)
    .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: questionsCollection.path,
            operation: 'create',
            requestResourceData: newQuestionData
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });

  return {
    id: questionRef.id,
    ...newQuestionData,
    createdAt: new Date(),
  } as Question;
}

export async function answerQuestion(questionId: string, answerText: string): Promise<Question | undefined> {
  const questionRef = doc(questionsCollection, questionId);
  const updatedData = {
    answerText,
    isAnswered: true,
    answeredAt: serverTimestamp(),
  };

  setDoc(questionRef, updatedData, { merge: true })
    .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: questionRef.path,
            operation: 'update',
            requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });

  const questionDoc = await getDoc(questionRef);
  if (!questionDoc.exists()) return undefined;

  const data = questionDoc.data();
  return {
    id: questionDoc.id,
    ...data,
    ...updatedData,
    createdAt: data.createdAt?.toDate(),
    answeredAt: new Date(),
  } as Question;
}

export async function deleteQuestion(questionId: string): Promise<void> {
    const questionRef = doc(questionsCollection, questionId);
    deleteDoc(questionRef).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: questionRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}

export async function addUser(details: Omit<User, 'id' | 'createdAt' | 'bio'> & { id: string }): Promise<User> {
  const { id, ...rest } = details;
  const newUser: Omit<User, 'id'> = {
    ...rest,
    bio: null,
    createdAt: new Date(),
  };
  const userRef = doc(usersCollection, id);

  setDoc(userRef, newUser)
    .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: newUser,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });

  return { id, ...newUser };
}

export async function getQuestionById(questionId: string): Promise<Question | undefined> {
  const questionDocRef = doc(questionsCollection, questionId);
  try {
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
  } catch (serverError) {
     const permissionError = new FirestorePermissionError({
        path: questionDocRef.path,
        operation: 'get',
    });
    errorEmitter.emit('permission-error', permissionError);
    return undefined;
  }
}
