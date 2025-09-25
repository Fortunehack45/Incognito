'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, initializeApp, getApps, getApp } from 'firebase/auth';

import {
  addUser,
  getUserByUsername,
} from './data';
import { createSession, clearSession } from './auth';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase for SERVER-SIDE use only
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);


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
