'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { validateQuestion } from '@/lib/actions';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';

const formSchema = z.object({
  questionText: z.string().min(10, 'Question must be at least 10 characters.').max(280, 'Question cannot be more than 280 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

export function AskQuestionForm({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const firestore = useFirestore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      questionText: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsPending(true);
    const result = await validateQuestion(userId, values.questionText);
    
    if (result.error) {
        toast({
            title: 'Oops!',
            description: result.error,
            variant: 'destructive',
        });
        setIsPending(false);
    } else {
        try {
            const questionsCollection = collection(firestore, 'questions');
            await addDoc(questionsCollection, {
                toUserId: userId,
                questionText: values.questionText,
                answerText: null,
                isAnswered: false,
                createdAt: serverTimestamp(),
                answeredAt: null,
            });

            toast({
                title: 'Question sent!',
                description: 'Your question has been sent anonymously.',
            });
            form.reset();

        } catch (e) {
             toast({
                title: 'Database Error',
                description: 'Could not submit your question.',
                variant: 'destructive',
            });
        } finally {
            setIsPending(false);
        }
    }
  }

  return (
     <Card>
      <CardHeader>
        <CardTitle>Ask an Anonymous Question</CardTitle>
        <CardDescription>Your identity will be kept a secret.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="questionText"
                render={({ field }) => (
                    <FormItem>
                    <FormControl>
                        <Textarea
                        placeholder="What's on your mind?"
                        className="resize-none"
                        rows={4}
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Ask Anonymously
                </Button>
            </form>
        </Form>
      </CardContent>
    </Card>
  );
}
