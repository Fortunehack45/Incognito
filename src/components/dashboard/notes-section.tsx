'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { useFirestore } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Trash2 } from 'lucide-react';
import type { Note, User } from '@/lib/types';


const noteSchema = z.object({
  contentText: z.string().min(1, 'Note cannot be empty.').max(500, 'Note is too long.'),
});

const LoadingSkeleton = () => (
    <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
            <Card key={i} className="bg-secondary/50 border-none">
                <CardContent className="pt-4 space-y-2">
                    <Skeleton className="h-10 w-full bg-secondary" />
                    <Skeleton className="h-4 w-1/2 bg-secondary" />
                </CardContent>
            </Card>
        ))}
    </div>
)

export function NotesSection({ user }: { user: User }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  // Path for the 'notes' subcollection under the current user
  const notesPath = `users/${user.id}/notes`;
  const { data: notes, loading } = useCollection<Note>(notesPath, {
      orderBy: ['createdAt', 'desc']
  });

  const form = useForm({
    resolver: zodResolver(noteSchema),
    defaultValues: { contentText: '' },
  });

  async function onSubmit(values: z.infer<typeof noteSchema>) {
    setIsSubmitting(true);
    try {
      const notesCollection = collection(firestore, notesPath);
      // This is where you create the new document in Firestore
      await addDoc(notesCollection, {
        contentText: values.contentText,
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Note added!' });
      form.reset();
    } catch (error) {
      console.error('Error adding note:', error);
      toast({ title: 'Error', description: 'Failed to add note.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  async function deleteNote(noteId: string) {
    try {
        const noteRef = doc(firestore, notesPath, noteId);
        await deleteDoc(noteRef);
        toast({ title: "Note deleted." });
    } catch(error) {
        console.error("Error deleting note: ", error);
        toast({ title: "Error", description: "Could not delete note.", variant: "destructive" });
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Notes</CardTitle>
        <CardDescription>Only you can see these notes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form to create a new note */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="contentText"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder="Write a new note..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Note
            </Button>
          </form>
        </Form>

        {/* List of existing notes */}
        <div className="space-y-4">
            {loading ? <LoadingSkeleton /> : notes && notes.length > 0 ? (
                notes.map((note) => (
                    <Card key={note.id} className="bg-secondary/50 border-none">
                        <CardContent className="pt-4">
                            <p className="text-sm">{note.contentText}</p>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-2">
                             <span>
                                {note.createdAt instanceof Timestamp ? formatDistanceToNow(note.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                            </span>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteNote(note.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))
            ) : (
                <p className="text-sm text-center text-muted-foreground pt-4">You have no notes yet.</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
