'use server';

import { revalidatePath } from 'next/cache';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore } from '@/firebase/server-init';
import { moderateQuestion } from '@/ai/flows/question-moderation-tool';
import { getQuestionById } from './data';
import { getUserById } from './auth';

const questionsCollection = collection(firestore, 'questions');

// --- Question Actions ---

export async function submitQuestion(userId: string, questionText: string) {
  if (!userId || !questionText) {
    return { error: 'Invalid input.' };
  }

  try {
    const moderationResult = await moderateQuestion({ questionText });
    if (!moderationResult.isAppropriate) {
      return { error: `Your question was deemed inappropriate. Reason: ${moderationResult.reason}` };
    }

    const newQuestionData = {
      toUserId: userId,
      questionText,
      answerText: null,
      isAnswered: false,
      createdAt: serverTimestamp(),
      answeredAt: null,
    };
    await addDoc(questionsCollection, newQuestionData);

    const user = await getUserById(userId);
    if (user) revalidatePath(`/u/${user.username}`);
    return { success: true };
  } catch (error) {
    console.error('Submit question error:', error);
    return { error: 'Failed to submit question.' };
  }
}

export async function answerQuestion(questionId: string, answerText: string) {
  if (!questionId || !answerText) {
    return { error: 'Invalid input.' };
  }

  try {
    const questionRef = doc(questionsCollection, questionId);
    const updatedData = {
      answerText,
      isAnswered: true,
      answeredAt: serverTimestamp(),
    };
    await setDoc(questionRef, updatedData, { merge: true });

    const question = await getQuestionById(questionId);
    if (question) {
      const user = await getUserById(question.toUserId);
      revalidatePath('/dashboard');
      if (user) revalidatePath(`/u/${user.username}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Answer question error:', error);
    return { error: 'Failed to answer question.' };
  }
}

export async function deleteQuestion(questionId: string) {
  if (!questionId) {
    return { error: 'Invalid input.' };
  }
  try {
    const question = await getQuestionById(questionId);
    await deleteDoc(doc(questionsCollection, questionId));

    if (question) {
      const user = await getUserById(question.toUserId);
      revalidatePath('/dashboard');
      if (user) revalidatePath(`/u/${user.username}`);
    }
    return { success: true };
  } catch (error) {
    console.error('Delete question error:', error);
    return { error: 'Failed to delete question.' };
  }
}

// --- Moderation Action ---

export async function runModeration(questionId: string) {
  if (!questionId) {
    return { error: 'Invalid question ID.' };
  }

  try {
    const question = await getQuestionById(questionId);
    if (!question) {
      return { error: 'Question not found.' };
    }

    const result = await moderateQuestion({ questionText: question.questionText });
    return { data: result };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to run moderation check.' };
  }
}
