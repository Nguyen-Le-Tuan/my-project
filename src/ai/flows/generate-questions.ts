import axios from 'axios'

export async function generateQuestions(paragraph: string, num_questions: number) {
  try {
    const res = await axios.post('http://localhost:5000/generate-question', {
      paragraph,
      num_questions
    }, {
      responseType: 'text' // 👈 Rất quan trọng khi server trả về text
    })

    return res.data // vì là plain text đã format sẵn
  } catch (error) {
    console.error('Lỗi khi tạo câu hỏi:', error)
    throw error
  }
}


// 'use server';
// /**
//  * @fileOverview Generates different types of questions based on student data.
//  *
//  * - generateQuestions - A function that generates questions based on student data.
//  * - GenerateQuestionsInput - The input type for the generateQuestions function.
//  * - GenerateQuestionsOutput - The return type for the generateQuestions function.
//  */

// import {ai} from '@/ai/ai-instance';
// import {z} from 'genkit';

// const GenerateQuestionsInputSchema = z.object({
//   studentData: z.string().describe('The student data to generate questions from.'),
//   subject: z.string().describe('The subject of the questions.'),
//   questionType: z.enum(['multiple choice', 'fill in the blank', 'Q&A']).describe('The type of questions to generate.'),
//   numberOfQuestions: z.number().int().positive().default(5).describe('The number of questions to generate.'),
// });
// export type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsInputSchema>;

// const GenerateQuestionsOutputSchema = z.object({
//   questions: z.array(z.string()).describe('The generated questions.'),
// });
// export type GenerateQuestionsOutput = z.infer<typeof GenerateQuestionsOutputSchema>;

// export async function generateQuestions(input: GenerateQuestionsInput): Promise<GenerateQuestionsOutput> {
//   return generateQuestionsFlow(input);
// }

// const generateQuestionsPrompt = ai.definePrompt({
//   name: 'generateQuestionsPrompt',
//   input: {
//     schema: z.object({
//       studentData: z.string().describe('The student data to generate questions from.'),
//       subject: z.string().describe('The subject of the questions.'),
//       questionType: z.enum(['multiple choice', 'fill in the blank', 'Q&A']).describe('The type of questions to generate.'),
//       numberOfQuestions: z.number().int().positive().default(5).describe('The number of questions to generate.'),
//     }),
//   },
//   output: {
//     schema: z.object({
//       questions: z.array(z.string()).describe('The generated questions.'),
//     }),
//   },
//   prompt: `You are a helpful AI assistant that generates questions for students.

//   Generate {{numberOfQuestions}} questions of type {{questionType}} for the subject {{subject}} based on the following student data:

//   {{studentData}}

//   The questions should be appropriate for the student's level and cover the key concepts in the student data.

//   Format each question as a separate item in a JSON array.`,
// });

// const generateQuestionsFlow = ai.defineFlow<
//   typeof GenerateQuestionsInputSchema,
//   typeof GenerateQuestionsOutputSchema
// >({
//   name: 'generateQuestionsFlow',
//   inputSchema: GenerateQuestionsInputSchema,
//   outputSchema: GenerateQuestionsOutputSchema,
// }, async input => {
//   const {output} = await generateQuestionsPrompt(input);
//   return output!;
// });
