'use client';

import { useUser } from '@/firebase/auth/use-user';
import type { Question, Note, User } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Skeleton } from '@/components/ui/skeleton';
import { QuestionTabs } from './question-tabs';
import { PublicLink } from './public-link';
import { Settings } from './settings';
import { PersonalNotes } from './personal-notes';

export function DashboardClient() {
  const { user, loading: userLoading } = useUser();
  const { data: userData, loading: userDataLoading } = useDoc<User>(user ? `users/${user.uid}` : null);
  
  const { data: questions, loading: questionsLoading } = useCollection<Question>(
    user ? `questions` : null,
    {
      where: ['toUserId', '==', user?.uid],
      orderBy: ['createdAt', 'desc'],
    }
  );

  const { data: notes, loading: notesLoading } = useCollection<Note>(
    user ? `users/${user.uid}/notes` : null,
    { orderBy: ['createdAt', 'desc'] }
  );

  const loading = userLoading || userDataLoading || questionsLoading || notesLoading;

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }
  
  const unansweredQuestions = questions?.filter(q => !q.isAnswered) ?? [];
  const answeredQuestions = questions?.filter(q => q.isAnswered) ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-12">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Your Dashboard</h1>
          <p className="text-muted-foreground mt-1">Here are all the questions you've received.</p>
        </div>
        <QuestionTabs unansweredQuestions={unansweredQuestions} answeredQuestions={answeredQuestions} />
      </div>

      <div className="space-y-8">
        <PublicLink username={userData?.username} />
        <Settings user={userData} />
        <PersonalNotes notes={notes} userId={user?.uid} />
      </div>
    </div>
  );
}
