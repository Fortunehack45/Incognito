'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { createSession, clearSession, getUserByUsername } from './auth';

// --- IMPORTANT ---
// The actual Firebase user creation and sign-in logic is now handled on the client-side
// in the respective form components. These server actions are now only responsible for
// session management and redirects after the client-side Firebase operations succeed.

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  uid: z.string(),
  idToken: z.string(),
});

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: 'Invalid fields from client.' };
  }

  const { uid, idToken } = validatedFields.data;
  
  try {
    await createSession(uid, idToken);
  } catch (error: any) {
    return { error: 'Failed to create session.' };
  }

  revalidatePath('/');
  redirect('/dashboard');
}


const signupSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(6),
  uid: z.string(),
  idToken: z.string(),
});

export async function signup(prevState: any, formData: FormData) {
    const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: 'Invalid fields provided from client.' };
    }
    
    const { username, uid, idToken } = validatedFields.data;

    const existingUserByUsername = await getUserByUsername(username);
    if (existingUserByUsername) {
        return { error: 'This username is already taken. Please choose another.' };
    }

    try {
        await createSession(uid, idToken);
    } catch (error: any) {
        console.error('Signup session error:', error);
        return { error: 'Failed to create a session.' };
    }
    
    revalidatePath('/');
    redirect('/dashboard');
}


export async function logout() {
  await clearSession();
  revalidatePath('/');
  redirect('/login');
}
