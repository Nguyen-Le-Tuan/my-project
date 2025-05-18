/**
 * @fileOverview Zod schemas and TypeScript types for practice exam generation.
 * This file centralizes the data structures used by practice exam flows.
 */

import { z } from 'genkit';

// Define the schema for the question type enum
export const QuestionTypeSchema = z.enum(['multiple_choice', 'fill_in_the_blank', 'q_and_a']);
export type QuestionType = z.infer<typeof QuestionTypeSchema>;

// Define the schema for a single practice question
export const PracticeQuestionSchema = z.object({
  question: z.string().describe('The text of the practice question.'),
  answer: z.string().describe('The correct answer to the question.'),
  type: QuestionTypeSchema.describe('The type of question this is.'),
  options: z.array(z.string()).optional().describe('The possible answers for multiple choice questions. Required only if type is multiple_choice.'),
});
export type PracticeQuestion = z.infer<typeof PracticeQuestionSchema>;

// Define the input schema for the topic-based flow
export const GeneratePracticeExamInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate the practice exam.'),
  studentProfilePicture: z
    .string()
    .describe(
      "Optional: The student's profile picture, as a data URI (e.g., 'data:image/png;base64,...'). Used for personalization context."
    )
    .optional(),
  questionType: z
    .array(QuestionTypeSchema)
    .describe('The types of questions to include. If empty or omitted, defaults to including all types.')
    .optional(),
});
export type GeneratePracticeExamInput = z.infer<typeof GeneratePracticeExamInputSchema>;

// Define the output schema for both topic-based and image-based flows
export const GeneratePracticeExamOutputSchema = z.object({
  examQuestions: z.array(PracticeQuestionSchema).describe('An array of the generated practice exam questions.'),
});
export type GeneratePracticeExamOutput = z.infer<typeof GeneratePracticeExamOutputSchema>;

// Define the input schema for the image-based generation flow
export const GenerateQuestionsFromImageInputSchema = z.object({
    imageDataUri: z
        .string()
        .describe(
            "The image containing educational content (text, diagrams, etc.), as a data URI (e.g., 'data:image/png;base64,...')."
        ),
    questionType: z
        .array(QuestionTypeSchema)
        .describe('The types of questions to include. If empty or omitted, defaults to including all types.')
        .optional(),
});
export type GenerateQuestionsFromImageInput = z.infer<typeof GenerateQuestionsFromImageInputSchema>;

// Output type for image-based flow is the same as topic-based
export type GenerateQuestionsFromImageOutput = GeneratePracticeExamOutput;
