'use server';
/**
 * @fileOverview AI-powered question moderation tool.
 *
 * - moderateQuestion - A function that moderates a question for inappropriate content.
 * - ModerateQuestionInput - The input type for the moderateQuestion function.
 * - ModerateQuestionOutput - The return type for the moderateQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateQuestionInputSchema = z.object({
  questionText: z.string().describe('The text of the question to moderate.'),
});
export type ModerateQuestionInput = z.infer<typeof ModerateQuestionInputSchema>;

const ModerateQuestionOutputSchema = z.object({
  isAppropriate: z.boolean().describe('Whether the question is appropriate or not.'),
  reason: z.string().optional().describe('The reason why the question is not appropriate, if applicable.'),
});
export type ModerateQuestionOutput = z.infer<typeof ModerateQuestionOutputSchema>;

export async function moderateQuestion(input: ModerateQuestionInput): Promise<ModerateQuestionOutput> {
  return moderateQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateQuestionPrompt',
  input: {schema: ModerateQuestionInputSchema},
  output: {schema: ModerateQuestionOutputSchema},
  prompt: `You are an AI assistant tasked with moderating questions to ensure they are appropriate and respectful.

  Determine whether the following question is appropriate based on these guidelines:
  - The question should not contain hate speech, harassment, or any form of discrimination.
  - The question should not be sexually explicit or exploit, abuse, or endanger children.
  - The question should not promote violence or incite hatred.
  - The question should respect privacy and not solicit or expose personal information.

  Question: {{{questionText}}}

  Respond with a JSON object indicating whether the question is appropriate and, if not, the reason why.
  {
    "isAppropriate": true/false,
    "reason": "reason why the question is not appropriate" // Optional
  }`,
});

const moderateQuestionFlow = ai.defineFlow(
  {
    name: 'moderateQuestionFlow',
    inputSchema: ModerateQuestionInputSchema,
    outputSchema: ModerateQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
