'use server';

import { revalidatePath } from 'next/cache';
import { moderateQuestion } from '@/ai/flows/question-moderation-tool';
import { getQuestionById } from './data';
import { getUserByUsername } from './auth';

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
        
        revalidatePath('/dashboard');

        // We also need to revalidate the public user profile page
        // This is a bit tricky since we only have the userId. We'd need to fetch the user to get their username.
        // For now, revalidating the dashboard is the most direct impact.
        // A more robust solution might involve passing the username or revalidating the path on the client after submission.

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
    if(user) {
        revalidatePath(`/u/${user.username}`);
    }
    revalidatePath('/dashboard');
  }
  return { success: true };
}

export async function revalidateDelete(questionId: string) {
   if (!questionId) {
    return { error: 'Invalid input.' };
  }
  try {
    // Revalidating the dashboard is enough as it will refetch
    revalidatePath('/dashboard');
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

// Helper function to get user by ID, useful for revalidation
async function getUserById(userId: string) {
    try {
        const firestore = (await import('@/firebase/admin')).firestore;
        const userDoc = await firestore.collection('users').doc(userId).get();
        if (!userDoc.exists) return null;
        return userDoc.data();
    } catch (error) {
        console.error("Failed to get user by ID", error);
        return null;
    }
}
