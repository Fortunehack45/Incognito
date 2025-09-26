'use client';

import { Timestamp, doc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { revalidateAnswer, revalidateDelete, runModeration } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Bot, Download, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { createRef, useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import type { ModerateQuestionOutput } from "@/ai/flows/question-moderation-tool";
import { useCollection } from "@/firebase/firestore/use-collection";
import { Skeleton } from "../ui/skeleton";
import { useFirestore } from '@/firebase/provider';
import type { User, Question } from '@/lib/types';
import html2canvas from 'html2canvas';
import { ShareImage } from './share-image';
import { useTheme } from '../theme-provider';


const answerSchema = z.object({
  answerText: z.string().min(1, "Answer cannot be empty.").max(1000, "Answer is too long."),
});

function AnswerForm({ questionId }: { questionId: string }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const firestore = useFirestore();
  const form = useForm({
    resolver: zodResolver(answerSchema),
    defaultValues: { answerText: "" },
  });

  async function onSubmit(values: z.infer<typeof answerSchema>) {
    startTransition(async () => {
        try {
            const questionRef = doc(firestore, 'questions', questionId);
            await setDoc(questionRef, {
                answerText: values.answerText,
                isAnswered: true,
                answeredAt: serverTimestamp(),
            }, { merge: true });

            await revalidateAnswer(questionId);

            toast({ title: "Success", description: "Your answer has been published." });
            form.reset();
        } catch (error) {
            toast({ title: "Error", description: "Failed to publish answer.", variant: "destructive" });
        }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="answerText"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea placeholder="Write your answer here..." {...field} className="bg-background" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Publish Answer
        </Button>
      </form>
    </Form>
  );
}

function QuestionActions({ question, user }: { question: Question, user: User }) {
    const { toast } = useToast();
    const { theme } = useTheme();
    const [isDeleting, startDeleteTransition] = useTransition();
    const [isModerating, startModerationTransition] = useTransition();
    const [isDownloading, startDownloadTransition] = useTransition();

    const [moderationResult, setModerationResult] = useState<ModerateQuestionOutput | null>(null);
    const [showModerationDialog, setShowModerationDialog] = useState(false);
    const firestore = useFirestore();
    const imageRef = createRef<HTMLDivElement>();


    const handleDelete = async () => {
        startDeleteTransition(async () => {
            try {
                await deleteDoc(doc(firestore, 'questions', question.id));
                await revalidateDelete(question.id);
                toast({ title: "Success", description: "Question deleted." });
            } catch (error) {
                 toast({ title: "Error", description: 'Failed to delete question', variant: "destructive" });
            }
        });
    };
    
    const handleModeration = async () => {
        startModerationTransition(async () => {
            const result = await runModeration(question.id);
            if (result.error) {
                toast({ title: "Moderation Error", description: result.error, variant: "destructive" });
            } else if (result.data) {
                setModerationResult(result.data);
                setShowModerationDialog(true);
            }
        });
    };
    
    const handleDownload = async () => {
        startDownloadTransition(async () => {
             if (!imageRef.current) {
                toast({ title: "Error", description: 'Could not create image.', variant: "destructive" });
                return;
            }
            try {
                const canvas = await html2canvas(imageRef.current, {
                    scale: 2, // Higher scale for better resolution
                    useCORS: true,
                    backgroundColor: null, 
                });
                const dataUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `incognito-question-${question.id}.png`;
                link.href = dataUrl;
                link.click();
            } catch (error) {
                 toast({ title: "Error", description: 'Failed to download image.', variant: "destructive" });
            }
        });
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleDownload} disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    <span className="ml-2 hidden sm:inline">Download</span>
                </Button>
                
                <Button variant="ghost" size="sm" onClick={handleModeration} disabled={isModerating}>
                    {isModerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                    <span className="ml-2 hidden sm:inline">Moderate</span>
                </Button>
                
                <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isDeleting} className="text-destructive hover:text-destructive">
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    <span className="ml-2 hidden sm:inline">Delete</span>
                </Button>
            </div>

            <div className="fixed top-[-9999px] left-[-9999px]">
                <ShareImage question={question} user={user} ref={imageRef} theme={theme} />
            </div>
            
            <AlertDialog open={showModerationDialog} onOpenChange={setShowModerationDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5" /> AI Moderation Result
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {moderationResult?.isAppropriate ? (
                             <span className="flex items-center gap-2 text-green-600"><ShieldCheck className="h-4 w-4" /> This question seems appropriate.</span>
                        ) : (
                            `This question may be inappropriate. Reason: "${moderationResult?.reason || 'Not specified'}"`
                        )}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                    {!moderationResult?.isAppropriate && (
                         <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete Question</AlertDialogAction>
                    )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

const LoadingSkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
             <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                </CardHeader>
            </Card>
        ))}
    </div>
)


export function DashboardClient({ user }: { user: User }) {
  const { data: questions, loading } = useCollection<Question>('questions', {
      where: ['toUserId', '==', user.id],
      orderBy: ['createdAt', 'desc']
  });

  const unansweredQuestions = questions?.filter(q => !q.isAnswered) || [];
  const answeredQuestions = questions?.filter(q => q.isAnswered) || [];

  const EmptyState = ({ title, description }: { title: string, description: string }) => (
    <div className="text-center py-16 px-4 border border-dashed rounded-lg">
        <h3 className="text-xl font-semibold font-headline">{title}</h3>
        <p className="text-muted-foreground mt-2">{description}</p>
    </div>
  );

  return (
    <Tabs defaultValue="unanswered">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="unanswered">Unanswered ({unansweredQuestions.length})</TabsTrigger>
        <TabsTrigger value="answered">Answered ({answeredQuestions.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="unanswered">
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle>Unanswered Questions</CardTitle>
            <CardDescription>Answer these questions to have them appear on your public profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? <LoadingSkeleton /> : unansweredQuestions.length > 0 ? (
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {unansweredQuestions.map((q) => (
                         <AccordionItem value={q.id} key={q.id} className="border-b-0">
                           <Card className="bg-secondary/50">
                            <AccordionTrigger className="hover:no-underline p-6">
                                <div className="flex-1 text-left">
                                    <p className="font-medium text-base">{q.questionText}</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Received {q.createdAt instanceof Timestamp ? formatDistanceToNow(q.createdAt.toDate(), { addSuffix: true }) : ''}
                                    </p>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-6 pt-0 space-y-4">
                               <AnswerForm questionId={q.id} />
                               <div className="border-t pt-4 flex justify-end">
                                    <QuestionActions question={q} user={user} />
                               </div>
                            </AccordionContent>
                           </Card>
                         </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <EmptyState title="No unanswered questions" description="Share your link to get more questions!" />
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="answered">
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle>Answered Questions</CardTitle>
            <CardDescription>These are publicly visible on your profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? <LoadingSkeleton /> : answeredQuestions.length > 0 ? (
                answeredQuestions.map((q) => (
                    <Card key={q.id} className="bg-secondary/50">
                        <CardHeader>
                            <CardDescription>Anonymous asked:</CardDescription>
                            <CardTitle className="text-lg font-normal">{q.questionText}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="border-l-2 border-primary pl-4 text-muted-foreground italic">"{q.answerText}"</p>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">
                                Answered {q.answeredAt instanceof Timestamp ? formatDistanceToNow(q.answeredAt.toDate(), { addSuffix: true }) : ''}
                            </p>
                            <QuestionActions question={q} user={user} />
                        </CardFooter>
                    </Card>
                ))
            ) : (
                 <EmptyState title="No answered questions yet" description="Answer some questions from the 'Unanswered' tab." />
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

    