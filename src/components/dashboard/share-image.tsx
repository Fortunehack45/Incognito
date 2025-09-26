'use client';
import { Question, User } from "@/lib/types";
import { forwardRef } from "react";
import { Logo } from "../logo";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Theme } from "../theme-provider";

interface ShareImageProps {
  question: Question;
  user: User;
  theme: Theme;
}

// Using forwardRef to pass the ref to the underlying div element
export const ShareImage = forwardRef<HTMLDivElement, ShareImageProps>(
  ({ question, user, theme }, ref) => {
    
    const dateToFormat = question.answeredAt || question.createdAt;
    const dateLabel = question.answeredAt ? 'Answered on' : 'Received on';

    return (
      <div
        ref={ref}
        className={cn(
            "w-[600px] p-8 bg-background text-foreground border border-border",
            theme
        )}
        // Ensure the component has a fixed size for consistent image output
        style={{ width: 600, height: 'auto' }}
      >
        <div className="space-y-6">
            <Logo />
            
            <div className="space-y-4 p-6 bg-card rounded-lg border border-border shadow-lg">
                <div>
                    <p className="text-sm text-muted-foreground font-sans">Anonymous asked:</p>
                    <p className="text-xl font-semibold font-sans mt-1">
                        {question.questionText}
                    </p>
                </div>

                {question.answerText && (
                  <>
                    <div className="border-t border-border my-4"></div>
                    <div>
                        <p className="text-sm text-primary font-semibold font-sans">Your answer:</p>
                        <p className="text-lg text-foreground/90 italic font-sans mt-1">
                            "{question.answerText}"
                        </p>
                    </div>
                  </>
                )}
            </div>

            <div className="flex justify-between items-center text-sm text-muted-foreground font-sans">
                 <span>@{user.username}</span>
                 <span>{dateLabel} {dateToFormat ? format(new Date(dateToFormat as any), 'MMMM d, yyyy') : ''}</span>
            </div>
        </div>
      </div>
    );
  }
);

ShareImage.displayName = "ShareImage";

    