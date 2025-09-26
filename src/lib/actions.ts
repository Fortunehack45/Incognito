'use server';

import { revalidatePath } from 'next/cache';
import { moderateQuestion } from '@/ai/flows/question-moderation-tool';
import { getQuestionById } from './data';
import { firestore } from '@/firebase/admin';
import type { User } from './types';

// --- Question Actions ---

export async function validateQuestion(user: User, questionText: string) {
    if (!user || !questionText) {
        return { error: 'Invalid input.' };
    }

    try {
        if (user.isModerationEnabled) {
            const moderationResult = await moderateQuestion({ questionText });
            if (!moderationResult.isAppropriate) {
                return { error: `Your question was deemed inappropriate. Reason: ${moderationResult.reason}` };
            }
        }
        
        revalidatePath('/dashboard');

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
export async function getUserById(userId: string) {
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
