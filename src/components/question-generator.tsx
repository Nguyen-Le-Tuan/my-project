'use client';

import type { ChangeEvent, FormEvent } from 'react';
import { useState, useTransition, useRef } from 'react';
import { generatePracticeExam } from '@/ai/flows/create-practice-exam';
import { generateQuestionsFromImage } from '@/ai/flows/generate-questions-from-image';
import type {
  GeneratePracticeExamInput,
  GeneratePracticeExamOutput,
} from '@/ai/flows/create-practice-exam';
import type { GenerateQuestionsFromImageInput } from '@/ai/flows/generate-questions-from-image';
import type { PracticeQuestion, QuestionType } from '@/ai/schemas/practice-exam-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Image as ImageIcon, XCircle } from 'lucide-react';
import Image from 'next/image';

interface QuestionGeneratorProps {
  profilePicture: string | null;
}

export default function QuestionGenerator({ profilePicture }: QuestionGeneratorProps) {
  const [topic, setTopic] = useState<string>('');
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([
    'multiple_choice',
    'fill_in_the_blank',
    'q_and_a',
  ]);
  const [generatedExam, setGeneratedExam] = useState<GeneratePracticeExamOutput | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [uploadedImageDataUri, setUploadedImageDataUri] = useState<string | null>(null);
  const [generationSource, setGenerationSource] = useState<'topic' | 'image'>('topic');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleTypeChange = (type: QuestionType) => {
    setSelectedTypes((prev) => {
      const newTypes = prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type];
      return newTypes.length > 0 ? newTypes : prev;
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please select an image file.',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please select an image smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImageDataUri(reader.result as string);
        setTopic('');
        setGenerationSource('image');
        toast({
          title: 'Image Selected',
          description: 'Image ready for analysis. Topic input cleared.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setUploadedImageDataUri(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setGenerationSource('topic');
    toast({ title: 'Image Cleared', description: 'You can now enter a topic.' });
  };

  const handleGenerateExam = (event: FormEvent) => {
    event.preventDefault();
    const hasImage = !!uploadedImageDataUri;
    const hasTopic = !!topic.trim();

    if (!hasImage && !hasTopic) {
      toast({
        title: 'Input Required',
        description: 'Please enter a topic OR upload an image.',
        variant: 'destructive',
      });
      return;
    }

    if (hasImage && hasTopic) {
      toast({
        title: 'Conflicting Inputs',
        description: 'Using the uploaded image. Topic input ignored.',
      });
    }

    if (!selectedTypes || selectedTypes.length === 0) {
      toast({
        title: 'Question Type Required',
        description: 'Please select at least one question type.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      setGeneratedExam(null);
      setUserAnswers({});
      setSubmitted(false);

      try {
        let result: GeneratePracticeExamOutput;
        if (hasImage && uploadedImageDataUri) {
          setGenerationSource('image');
          const input: GenerateQuestionsFromImageInput = {
            imageDataUri: uploadedImageDataUri,
            questionType: selectedTypes,
          };
          result = await generateQuestionsFromImage(input);
          toast({
            title: 'Exam Generated from Image!',
            description: 'Practice questions based on the uploaded image are ready.',
          });
        } else {
          setGenerationSource('topic');
          const input: GeneratePracticeExamInput = {
            topic,
            questionType: selectedTypes,
            studentProfilePicture: profilePicture ?? undefined,
          };
          result = await generatePracticeExam(input);
          toast({
            title: 'Exam Generated!',
            description: `Practice exam on "${topic}" ready.`,
          });
        }
        setGeneratedExam(result);
      } catch (error) {
        console.error('Error generating exam:', error);
        toast({
          title: 'Generation Failed',
          description: `Could not generate the practice exam${hasImage ? ' from the image' : ''}. Please try again.`,
          variant: 'destructive',
        });
        setGeneratedExam(null);
      }
    });
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmitExam = () => {
    setSubmitted(true);
    toast({ title: 'Exam Submitted', description: 'Check your answers below.' });
  };

  const calculateScore = () => {
    if (!generatedExam) return { score: 0, total: 0 };
    let correctCount = 0;
    generatedExam.examQuestions.forEach((q, index) => {
      const userAnswerNormalized = userAnswers[index]?.trim().toLowerCase() ?? '';
      const correctAnswerNormalized = q.answer.trim().toLowerCase();
      if (userAnswerNormalized === correctAnswerNormalized) {
        correctCount++;
      }
    });
    return { score: correctCount, total: generatedExam.examQuestions.length };
  };

  const { score, total } = submitted ? calculateScore() : { score: 0, total: 0 };

  const questionTypes: { id: QuestionType; label: string }[] = [
    { id: 'multiple_choice', label: 'Multiple Choice' },
    { id: 'fill_in_the_blank', label: 'Fill in the Blank' },
    { id: 'q_and_a', label: 'Q&A' },
  ];

  return (
    <div className="space-y-6 pl-[200px]">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>Generate Practice Exam</CardTitle>
          <CardDescription>
            Enter a topic or upload an image, then select question types.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerateExam} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  if (e.target.value.trim()) {
                    clearImage();
                    setGenerationSource('topic');
                  }
                }}
                placeholder="e.g., Photosynthesis, World War II"
                disabled={!!uploadedImageDataUri || isPending}
              />
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-upload">Upload Image</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadedImageDataUri ? 'Change Image' : 'Upload Image'}
                </Button>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                  disabled={isPending}
                />
                {uploadedImageDataUri && !isPending && (
                  <div className="flex items-center gap-2 border rounded-md p-1 bg-muted/50">
                    <ImageIcon className="h-6 w-6 text-muted-foreground ml-1" />
                    <span className="text-sm text-muted-foreground truncate flex-grow">Image selected</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={clearImage}
                      className="h-6 w-6 text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {uploadedImageDataUri && (
                <div className="mt-2 border rounded-md overflow-hidden shadow-sm max-h-48">
                  <Image
                    src={uploadedImageDataUri}
                    alt="Uploaded content preview"
                    width={400}
                    height={192}
                    className="object-contain w-full h-auto max-h-48"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <Label>Question Types</Label>
              <div className="flex flex-wrap gap-4 pt-2">
                {questionTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.id}
                      checked={selectedTypes.includes(type.id)}
                      onCheckedChange={() => handleTypeChange(type.id)}
                      disabled={isPending}
                    />
                    <Label htmlFor={type.id} className="font-normal cursor-pointer">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={
                isPending || (!uploadedImageDataUri && !topic.trim()) || selectedTypes.length === 0
              }
              className="w-full text-white bg-[#009951] hover:bg-[#007f42] rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending
                ? 'Generating...'
                : `Generate Exam ${uploadedImageDataUri ? 'from Image' : 'from Topic'}`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {generatedExam && !isPending && (
        <Card className="shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle>
              Practice Exam: {generationSource === 'image' ? 'From Uploaded Image' : topic}
            </CardTitle>
            {submitted && <CardDescription>Your score: {score} / {total}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-6">
            {generatedExam.examQuestions.map((q, index) => (
              <Card
                key={index}
                className={`p-4 rounded-md ${
                  submitted
                    ? userAnswers[index]?.trim().toLowerCase() === q.answer.trim().toLowerCase()
                      ? 'bg-secondary/30 border-secondary'
                      : 'bg-destructive/10 border-destructive'
                    : 'bg-card'
                }`}
              >
                <Label className="font-semibold block mb-2">
                  {index + 1}. {q.question}
                </Label>
                {q.type === 'multiple_choice' && q.options ? (
                  <RadioGroup
                    onValueChange={(value: string) => handleAnswerChange(index, value)}
                    value={userAnswers[index]}
                    disabled={submitted}
                    className="space-y-2"
                  >
                    {q.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`q${index}-opt${optIndex}`} />
                        <Label htmlFor={`q${index}-opt${optIndex}`} className="font-normal cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <Input
                    type="text"
                    value={userAnswers[index] || ''}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    disabled={submitted}
                    placeholder="Your answer"
                  />
                )}
                {submitted && (
                  <p
                    className={`mt-2 text-sm ${
                      userAnswers[index]?.trim().toLowerCase() === q.answer.trim().toLowerCase()
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-red-700 dark:text-red-400'
                    }`}
                  >
                    Correct Answer: <span className="font-medium">{q.answer}</span>
                  </p>
                )}
              </Card>
            ))}
          </CardContent>
          <CardFooter>
            {!submitted ? (
              <Button onClick={handleSubmitExam} className="w-full bg-accent text-accent-foreground">
                Submit Exam
              </Button>
            ) : (
              <Button
                onClick={handleGenerateExam}
                disabled={isPending}
                className="w-full text-white bg-[#009951] hover:bg-[#007f42] rounded-md shadow-md"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending
                  ? 'Generating...'
                  : `Generate New Exam ${generationSource === 'image' ? 'from Image' : 'from Topic'}`}
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
