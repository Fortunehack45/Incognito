import { getUserByUsername, getQuestionsForUser } from "@/lib/data";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { formatDistanceToNow } from "date-fns";
import { AskQuestionForm } from "@/components/profile/ask-question-form";

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const user = await getUserByUsername(params.username);

  if (!user) {
    notFound();
  }

  const allQuestions = await getQuestionsForUser(user.id);
  const answeredQuestions = allQuestions.filter((q) => q.isAnswered);
  const avatarImage = PlaceHolderImages.find((p) => p.id === `avatar-${user.id}`);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="space-y-8">
        {/* Profile Card */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-center gap-6 p-6">
            <Avatar className="h-24 w-24 border-4 border-primary">
              {avatarImage && <AvatarImage src={avatarImage.imageUrl} alt={user.username} />}
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
