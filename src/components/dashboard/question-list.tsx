'use client';

import { useState } from 'react';
import type { Question } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore } from '@/firebase/provider';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { revalidateAnswer, revalidateDelete } from '@/lib/actions';

interface QuestionListProps {
  questions: Question[];
  title: string;
  emptyStateMessage: string;
  isAnsweredList?: boolean;
}

export function QuestionList({ questions, title, emptyStateMessage, isAnsweredList = false }: QuestionListProps) {
  const [answerText, setAnswerText] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleAnswerSubmit = async (questionId: string) => {
    const text = answerText[questionId];
    if (!text || !text.trim()) {
      toast({ title: 'Answer cannot be empty', variant: 'destructive' });
      return;
    }
    setLoading(prev => ({ ...prev, [questionId]: true }));
    try {
      const questionRef = doc(firestore, 'questions', questionId);
      await updateDoc(questionRef, {
        answerText: text,
        isAnswered: true,
        answeredAt: serverTimestamp(),
      });
      await revalidateAnswer(questionId);
      toast({ title: 'Question answered!' });
      setAnswerText(prev => {
        const newState = {...prev};
        delete newState[questionId];
        return newState;
      })
    } catch (error) {
      toast({ title: 'Failed to answer question', variant: 'destructive' });
    } finally {
      setLoading(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const handleDelete = async (questionId: string) => {
    setLoading(prev => ({ ...prev, [questionId]: true }));
    try {
      await deleteDoc(doc(firestore, 'questions', questionId));
      await revalidateDelete(questionId);
      toast({ title: 'Question deleted' });
    } catch (error) {
      toast({ title: 'Failed to delete question', variant: 'destructive' });
    } finally {
      setLoading(prev => ({ ...prev, [questionId]: false }));
    }
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground mt-2">{emptyStateMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-headline font-bold">{title}</h2>
      {questions.map((q) => (
        <Card key={q.id} className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg font-normal break-words">{q.questionText}</CardTitle>
            <CardDescription>
                Received on {new Date(q.createdAt as any).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          {isAnsweredList ? (
            <>
            <CardContent>
                <p className="text-base bg-background/50 p-4 rounded-md italic">"{q.answerText}"</p>
            </CardContent>
             <CardFooter className="flex justify-end">
                <Button variant="destructive" size="sm" onClick={() => handleDelete(q.id)} disabled={loading[q.id]}>
                    {loading[q.id] ? 'Deleting...' : 'Delete'}
                </Button>
            </CardFooter>
            </>
          ) : (
            <>
              <CardContent>
                <Textarea
                  placeholder="Type your answer here..."
                  value={answerText[q.id] || ''}
                  onChange={(e) => setAnswerText(prev => ({ ...prev, [q.id]: e.target.value }))}
                  className="text-base"
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="destructive" onClick={() => handleDelete(q.id)} disabled={loading[q.id]}>
                  {loading[q.id] ? 'Deleting...' : 'Delete'}
                </Button>
                <Button onClick={() => handleAnswerSubmit(q.id)} disabled={loading[q.id]}>
                  {loading[q.id] ? 'Answering...' : 'Answer'}
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      ))}
    </div>
  );
}
