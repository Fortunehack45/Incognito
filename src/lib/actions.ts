'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

import {
  addUser,
  answerQuestion as answerQuestionDb,
  deleteQuestion as deleteQuestionDb,
  getUserByUsername,
  getQuestionById,
  addQuestion,
  getUserByEmail
} from './data';
import { createSession, clearSession } from './auth';
import { moderateQuestion } from '@/ai/flows/question-moderation-tool';
import { initializeFirebase } from '@/firebase';

const { auth } = initializeFirebase();

// --- Auth Actions ---

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: 'Invalid email or password.' };
  }

  const { email, password } = validatedFields.data;
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const idToken = await user.getIdToken();
    await createSession(user.uid, idToken);
  } catch (error: any) {
    return { error: 'Invalid email or password.' };
  }

  revalidatePath('/');
  redirect('/dashboard');
}


const signupSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signup(prevState: any, formData: FormData) {
    const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: 'Invalid fields provided.' };
    }
    
    const { email, username, password } = validatedFields.data;

    const existingUserByUsername = await getUserByUsername(username);
    if (existingUserByUsername) {
        return { error: 'This username is already taken.' };
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await addUser({ id: user.uid, email, username });
        
        const idToken = await user.getIdToken();
        await createSession(user.uid, idToken);
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            return { error: 'An account with this email already exists.' };
        }
        console.error('Signup error:', error);
        return { error: 'Failed to create an account.' };
    }
    
    revalidatePath('/');
    redirect('/dashboard');
}


export async function logout() {
  await clearSession();
  revalidatePath('/');
  redirect('/login');
}

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
        await addQuestion(userId, questionText);
        const user = await getUserById(userId);
        if (user) revalidatePath(`/u/${user.username}`);
        return { success: true };
    } catch (error) {
        return { error: 'Failed to submit question.' };
    }
}


export async function answerQuestion(questionId: string, answerText: string) {
    if (!questionId || !answerText) {
        return { error: 'Invalid input.' };
    }

    try {
        const question = await answerQuestionDb(questionId, answerText);
        if (question) {
            const user = await getUserById(question.toUserId);
            revalidatePath('/dashboard');
            if(user) revalidatePath(`/u/${user.username}`);
        }
        return { success: true };
    } catch (error) {
        return { error: 'Failed to answer question.' };
    }
}


export async function deleteQuestion(questionId: string) {
    if (!questionId) {
        return { error: 'Invalid input.' };
    }
    try {
        const question = await getQuestionById(questionId);
        await deleteQuestionDb(questionId);
        if (question) {
            const user = await getUserById(question.toUserId);
            revalidatePath('/dashboard');
            if (user) revalidatePath(`/u/${user.username}`);
        }
        return { success: true };
    } catch (error) {
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

    } catch(e) {
        console.error(e);
        return { error: 'Failed to run moderation check.' };
    }
}
