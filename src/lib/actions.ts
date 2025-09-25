'use server';

import { revalidatePath } from 'next/cache';
import { moderateQuestion } from '@/ai/flows/question-moderation-tool';
import { getQuestionById } from './data';
import { getUserById } from './auth';

// --- Question Actions ---

export async function validateQuestion(userId: string, questionText: string) {
    if (!userId || !questionText) {
        return { error: 'Invalid input.' };
    }

    try {
        const moderationResult = await moderateQuestion({ questionText });
        if (!moderationResult.isAppropriate) {
        return { error: `Your question was deemed inappropriate. Reason: ${moderationResult.reason}` };
        }
        
        const user = await getUserById(userId);
        if (user) revalidatePath(`/u/${user.username}`);

        return { success: true };
    } catch (error) {
        console.error('Submit question error:', error);
        return { error: 'Failed to submit question.' };
    }
}


export async function revalidateAnswer(questionId: string) {
  if (!questionId) {
    return { error: 'Invalid input.' };
  }
  const question = await getQuestionById(questionId);
  if (question) {
    const user = await getUserById(question.toUserId);
    revalidatePath('/dashboard');
    if (user) revalidatePath(`/u/${user.username}`);
  }
  return { success: true };
}

export async function revalidateDelete(questionId: string) {
   if (!questionId) {
    return { error: 'Invalid input.' };
  }
  try {
    const question = await getQuestionById(questionId);
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
