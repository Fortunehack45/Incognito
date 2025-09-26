'use client';

import { useState } from 'react';
import type { Note } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase/provider';
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PersonalNotesProps {
  notes: Note[] | null;
  userId: string | undefined;
}

export function PersonalNotes({ notes, userId }: PersonalNotesProps) {
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleAddNote = async () => {
    if (!newNote.trim() || !userId) return;
    setLoading(true);
    try {
      const notesCollection = collection(firestore, `users/${userId}/notes`);
      await addDoc(notesCollection, {
        contentText: newNote,
        createdAt: serverTimestamp(),
      });
      setNewNote('');
      toast({ title: 'Note added!' });
    } catch (error) {
      toast({ title: 'Failed to add note.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!userId) return;
    try {
        await deleteDoc(doc(firestore, `users/${userId}/notes`, noteId));
        toast({ title: 'Note deleted.' });
    } catch (error) {
        toast({ title: 'Failed to delete note.', variant: 'destructive' });
    }
  }

  return (
    <Card className="bg-card/50">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Personal Notes</CardTitle>
        <CardDescription>Only you can see these notes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Write a new note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="text-base"
          />
          <Button onClick={handleAddNote} disabled={loading || !newNote.trim()}>
            {loading ? 'Adding...' : 'Add Note'}
          </Button>
        </div>
        <div className="space-y-2">
            {notes && notes.length > 0 ? (
                 <ScrollArea className="h-48 pr-4">
                    <div className='space-y-3'>
                    {notes.map((note) => (
                        <div key={note.id} className="text-sm p-3 bg-background/50 rounded-md flex justify-between items-start gap-2">
                            <p className="flex-grow whitespace-pre-wrap">{note.contentText}</p>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleDeleteNote(note.id)}>
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                    ))}
                    </div>
                </ScrollArea>
            ) : (
                <p className="text-sm text-center text-muted-foreground py-4">You have no notes yet.</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
