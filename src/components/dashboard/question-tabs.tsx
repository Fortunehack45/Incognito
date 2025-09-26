'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuestionList } from './question-list';
import type { Question } from '@/lib/types';

interface QuestionTabsProps {
  unansweredQuestions: Question[];
  answeredQuestions: Question[];
}

export function QuestionTabs({ unansweredQuestions, answeredQuestions }: QuestionTabsProps) {
  return (
    <Tabs defaultValue="unanswered" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-card/50">
        <TabsTrigger value="unanswered">Unanswered ({unansweredQuestions.length})</TabsTrigger>
        <TabsTrigger value="answered">Answered ({answeredQuestions.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="unanswered">
        <QuestionList
          questions={unansweredQuestions}
          title="Unanswered Questions"
          emptyStateMessage="No unanswered questions. Share your link to get more!"
        />
      </TabsContent>
      <TabsContent value="answered">
        <QuestionList
          questions={answeredQuestions}
          title="Answered Questions"
          emptyStateMessage="You haven't answered any questions yet."
          isAnsweredList
        />
      </TabsContent>
    </Tabs>
  );
}
