// This file defines a Genkit flow for generating practice exams on a given topic.
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating practice exams on a given topic.
 * It exports the main async function `generatePracticeExam` and its associated input/output types.
 * Schemas are imported from `@/ai/schemas/practice-exam-schemas.ts`.
 *
 * - generatePracticeExam - A function that takes a topic and optionally a student profile picture and question types, returning a practice exam.
 * - GeneratePracticeExamInput - The input type for the generatePracticeExam function. (Imported and re-exported)
 * - GeneratePracticeExamOutput - The return type for the generatePracticeExam function. (Imported and re-exported)
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit'; // Keep Zod import if needed for local validation/parsing
import {
  GeneratePracticeExamInputSchema,
  GeneratePracticeExamOutputSchema,
  type GeneratePracticeExamInput as GeneratePracticeExamInputType, // Import type with alias
  type GeneratePracticeExamOutput as GeneratePracticeExamOutputType // Import type with alias
} from '@/ai/schemas/practice-exam-schemas'; // Import schemas and types from the new location

// Re-export types for external use
export type GeneratePracticeExamInput = GeneratePracticeExamInputType;
export type GeneratePracticeExamOutput = GeneratePracticeExamOutputType;

// Define the main prompt for generating the exam
const generatePracticeExamPrompt = ai.definePrompt({
  name: 'generatePracticeExamPrompt',
  input: {
    schema: GeneratePracticeExamInputSchema, // Use the imported input schema
  },
  output: {
    schema: GeneratePracticeExamOutputSchema, // Use the imported output schema
  },
  prompt: `You are StudyPark, an AI assistant designed to create engaging practice exams for students.

  {{#if studentProfilePicture}}The student has provided this profile picture for personalization context: {{media url=studentProfilePicture}}. Tailor the tone slightly if appropriate, but maintain educational focus.{{else}}No profile picture provided.{{/if}}

  Generate a practice exam about the topic: **{{{topic}}}**.

  {{#if questionType}}Include only the following question types: {{#each questionType}}{{#unless @first}}, {{/unless}}{{this}}{{/each}}.{{else}}Include a mix of question types: multiple choice, fill-in-the-blank, and Q&A.{{/if}}

  Return the exam as a JSON object containing an 'examQuestions' array. Each object in the array must follow this structure:
  {
    "question": "The question text",
    "answer": "The correct answer",
    "type": "question_type" // must be one of 'multiple_choice', 'fill_in_the_blank', 'q_and_a'
    "options": ["option1", "option2", ...] // REQUIRED only if type is 'multiple_choice', otherwise omit or leave empty
  }

  Ensure the questions are clear, accurate, and relevant to the specified topic. For multiple-choice questions, provide plausible distractors along with the correct answer within the 'options' array.
  `,
});

// Define the main flow function
const generatePracticeExamFlow = ai.defineFlow<
  typeof GeneratePracticeExamInputSchema,
  typeof GeneratePracticeExamOutputSchema
>({
  name: 'generatePracticeExamFlow',
  inputSchema: GeneratePracticeExamInputSchema,
  outputSchema: GeneratePracticeExamOutputSchema,
},
async (input) => {
   // Ensure default behavior if questionType is empty array or undefined
    const typesToGenerate = input.questionType && input.questionType.length > 0 ? input.questionType : undefined;

   const finalInput = { ...input, questionType: typesToGenerate };


  const {output} = await generatePracticeExamPrompt(finalInput);
  if (!output) {
    throw new Error("Failed to generate exam: AI model did not return valid output.");
  }
  // Basic validation (more robust validation could be added)
   if (!output.examQuestions || !Array.isArray(output.examQuestions)) {
     throw new Error("Failed to generate exam: Output format is incorrect.");
   }

  return output;
});

// Export the server action function
export async function generatePracticeExam(
  input: GeneratePracticeExamInput // Use the re-exported type
): Promise<GeneratePracticeExamOutput> { // Use the re-exported type
  // Validate input using the imported Zod schema
   const validatedInput = GeneratePracticeExamInputSchema.parse(input);
  return generatePracticeExamFlow(validatedInput);
}
