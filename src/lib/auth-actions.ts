'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { createSession, clearSession, type User, getUserByUsername } from './auth';
import { auth, firestore } from '@/firebase/server-init';

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
        
        const newUser: Omit<User, 'id'> = {
          email,
          username,
          bio: null,
          createdAt: new Date(),
        };
        await setDoc(doc(firestore, 'users', user.uid), newUser);
        
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
