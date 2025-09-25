import { getAuthenticatedUser } from "@/lib/auth";
import { getQuestionsForUser } from "@/lib/data";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Copy } from "lucide-react";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const questions = await getQuestionsForUser(user.id);
  const unansweredQuestions = questions.filter((q) => !q.isAnswered);
  const answeredQuestions = questions.filter((q) => q.isAnswered);
  
  const profileUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/u/${user.username}`;


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline">Your Dashboard</h1>
            <p className="text-muted-foreground">Here are all the questions you've received.</p>
          </div>
          <Card className="p-4 flex items-center gap-4">
             <div className="flex-grow">
                 <p className="text-sm font-semibold">Your public link:</p>
                 <Link href={profileUrl} className="text-sm text-primary hover:underline break-all">
                    {profileUrl}
                 </Link>
             </div>
             {/* Not implemented: client component with navigator.clipboard */}
             <Button variant="ghost" size="icon" disabled>
                 <Copy className="h-4 w-4" />
             </Button>
          </Card>
        </div>

        <DashboardClient
          unansweredQuestions={unansweredQuestions}
          answeredQuestions={answeredQuestions}
          user={user}
        />
      </div>
    </div>
  );
}
