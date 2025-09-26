'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase/provider';
import { doc, setDoc, getDocs, collection, query, where, serverTimestamp } from 'firebase/firestore';

const formSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters.').max(20, 'Username must be at most 20 characters.').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

export function SignupForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    startTransition(async () => {
      try {
        // 1. Check if username is already taken
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('username', '==', values.username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          toast({ title: 'Signup Failed', description: 'This username is already taken. Please choose another.', variant: 'destructive' });
          return;
        }

        // 2. Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;
        
        // 3. Create user profile document in Firestore
        const newUser = {
          id: user.uid,
          email: values.email,
          username: values.username,
          bio: '',
          createdAt: serverTimestamp(),
          isModerationEnabled: false, // Default to false
        };
        await setDoc(doc(firestore, 'users', user.uid), newUser);
        
        toast({ title: "Success!", description: "Your account has been created."});
        router.push('/dashboard');

      } catch (error: any) {
        let description = 'An unknown error occurred during signup.';
        if (error.code === 'auth/email-already-in-use') {
          description = 'An account with this email already exists.';
        }
        toast({ title: 'Signup Failed', description, variant: 'destructive' });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="your_username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          { isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign Up
        </Button>
      </form>
    </Form>
  );
}
