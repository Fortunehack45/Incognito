'use client';
import { getUserByUsername } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { AskQuestionForm } from "@/components/profile/ask-question-form";
import { useEffect, useState } from "react";
import type { Question, User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollection } from "@/firebase/firestore/use-collection";


function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-center gap-6 p-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-72" />
          </div>
        </CardHeader>
      </Card>
       <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             <Skeleton className="h-20 w-full" />
             <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Card>
            <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-32" />
            </CardContent>
        </Card>
      </div>
    </div>
  )
}


export default function ProfilePage({ params }: { params: { username: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const fetchedUser = await getUserByUsername(params.username);
      if (!fetchedUser) {
        notFound();
      } else {
        setUser(fetchedUser);
      }
      setLoadingUser(false);
    }
    fetchUser();
  }, [params.username]);

  const { data: allQuestions, loading: loadingQuestions } = useCollection<Question>(
    user ? 'questions' : null, 
    user ? { where: ['toUserId', '==', user.id], orderBy: ['createdAt', 'desc'] } : undefined
  );
  
  const answeredQuestions = allQuestions?.filter((q) => q.isAnswered) || [];

  const avatarImageUrl = "https://images.unsplash.com/photo-1613145997970-db84a7975fbb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxwcm9maWxlJTIwcGVyc29ufGVufDB8fHx8MTc1ODgxOTAzNXww&ixlib=rb-4.1.0&q=80&w=1080";

  if (loadingUser || loadingQuestions || !user) {
    return (
       <div className="container mx-auto max-w-3xl px-4 py-8">
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="space-y-8">
        {/* Profile Card */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-center gap-6 p-6">
            <Avatar className="h-24 w-24 border-4 border-primary">
              <AvatarImage src={avatarImageUrl} alt={user.username} />
              <AvatarFallback className="text-3xl">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <CardTitle className="text-3xl font-headline">@{user.username}</CardTitle>
              {user.bio && <CardDescription className="mt-2 text-lg">{user.bio}</CardDescription>}
            </div>
          </CardHeader>
        </Card>

        {/* Ask a Question Form */}
        <AskQuestionForm userId={user.id} />

        {/* Answered Questions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-headline">Answered Questions</h2>
          {answeredQuestions.length > 0 ? (
            answeredQuestions.map((q) => (
              <Card key={q.id}>
                <CardHeader>
                  <CardDescription>Anonymous asked:</CardDescription>
                  <CardTitle className="text-xl font-medium leading-relaxed">{q.questionText}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="border-l-4 border-accent pl-4 text-foreground/80">{q.answerText}</p>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    Answered {q.answeredAt ? formatDistanceToNow(q.answeredAt, { addSuffix: true }) : 'a while ago'}
                  </p>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">@{user.username} hasn't answered any questions yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
