'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating practice exams from an uploaded image containing educational content.
 * It exports the main async function `generateQuestionsFromImage` and its associated input/output types.
 * Schemas are imported from `@/ai/schemas/practice-exam-schemas.ts`.
 *
 * - generateQuestionsFromImage - A function that takes an image data URI and question types, returning a practice exam.
 * - GenerateQuestionsFromImageInput - The input type for the generateQuestionsFromImage function. (Imported and re-exported)
 * - GenerateQuestionsFromImageOutput - The return type for the generateQuestionsFromImage function (reuses type from schema file). (Imported and re-exported)
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit'; // Keep Zod import if needed for local validation/parsing
import {
  GenerateQuestionsFromImageInputSchema,
  GeneratePracticeExamOutputSchema, // Shared output schema
  type GenerateQuestionsFromImageInput as GenerateQuestionsFromImageInputType, // Import type with alias
  type GeneratePracticeExamOutput as GenerateQuestionsFromImageOutputType // Import shared output type alias
} from '@/ai/schemas/practice-exam-schemas'; // Import from the new schema location

// Re-export types for external use
export type GenerateQuestionsFromImageInput = GenerateQuestionsFromImageInputType;
export type GenerateQuestionsFromImageOutput = GenerateQuestionsFromImageOutputType;

// Define the prompt for generating the exam from an image
const generateQuestionsFromImagePrompt = ai.definePrompt({
  name: 'generateQuestionsFromImagePrompt',
  input: {
    schema: GenerateQuestionsFromImageInputSchema, // Use the imported input schema
  },
  output: {
    schema: GeneratePracticeExamOutputSchema, // Use the imported shared output schema
  },
  prompt: `You are EduGenius, an AI assistant specialized in creating practice questions from educational materials.

  Analyze the content of the following image:
  {{media url=imageDataUri}}

  Based *only* on the information present in the image (text, diagrams, concepts shown), generate a practice exam.

  {{#if questionType}}Include only the following question types: {{#each questionType}}{{#unless @first}}, {{/unless}}{{this}}{{/each}}.{{else}}Include a mix of question types: multiple choice, fill-in-the-blank, and Q&A.{{/if}}

  Return the exam as a JSON object containing an 'examQuestions' array. Each object in the array must follow this structure:
  {
    "question": "The question text based on the image content",
    "answer": "The correct answer based on the image content",
    "type": "question_type" // must be one of 'multiple_choice', 'fill_in_the_blank', 'q_and_a'
    "options": ["option1", "option2", ...] // REQUIRED only if type is 'multiple_choice', otherwise omit or leave empty
  }

  Ensure the questions are clear, accurate, and directly relevant to the content within the provided image. For multiple-choice questions, provide plausible distractors along with the correct answer within the 'options' array, all derived from the image. Do not infer information not present in the image.
  `,
});

// Define the flow function for image-based generation
const generateQuestionsFromImageFlow = ai.defineFlow<
  typeof GenerateQuestionsFromImageInputSchema,
  typeof GeneratePracticeExamOutputSchema // Output schema remains the same (shared)
>({
  name: 'generateQuestionsFromImageFlow',
  inputSchema: GenerateQuestionsFromImageInputSchema,
  outputSchema: GeneratePracticeExamOutputSchema, // Use the imported shared output schema
},
async (input) => {
  // Ensure default behavior if questionType is empty array or undefined
  const typesToGenerate = input.questionType && input.questionType.length > 0 ? input.questionType : undefined;
  const finalInput = { ...input, questionType: typesToGenerate };

  const { output } = await generateQuestionsFromImagePrompt(finalInput);
  if (!output) {
    throw new Error("Failed to generate exam from image: AI model did not return valid output.");
  }
  // Basic validation
  if (!output.examQuestions || !Array.isArray(output.examQuestions)) {
    throw new Error("Failed to generate exam from image: Output format is incorrect.");
  }

  return output;
});

// Export the server action function for image-based generation
export async function generateQuestionsFromImage(
  input: GenerateQuestionsFromImageInput // Use the re-exported type
): Promise<GenerateQuestionsFromImageOutput> { // Use the re-exported type
   // Validate input using the imported Zod schema
  const validatedInput = GenerateQuestionsFromImageInputSchema.parse(input);
  return generateQuestionsFromImageFlow(validatedInput);
}
