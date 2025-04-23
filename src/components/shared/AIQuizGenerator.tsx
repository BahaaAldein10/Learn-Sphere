'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createQuizQuestion } from '@/lib/actions/quiz.actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';

const quizGeneratorSchema = z
  .object({
    numMCQ: z.preprocess(
      (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
      z
        .number({ invalid_type_error: 'Enter a number' })
        .int('Must be an integer')
        .min(0, 'Cannot be negative')
        .max(50, 'Max 50 questions')
    ),
    numTF: z.preprocess(
      (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
      z
        .number({ invalid_type_error: 'Enter a number' })
        .int('Must be an integer')
        .min(0, 'Cannot be negative')
        .max(50, 'Max 50 questions')
    ),
    numShort: z.preprocess(
      (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
      z
        .number({ invalid_type_error: 'Enter a number' })
        .int('Must be an integer')
        .min(0, 'Cannot be negative')
        .max(50, 'Max 50 questions')
    ),
    criteria: z
      .string()
      .min(5, 'Give some guidance (e.g. “focus on inheritance, hooks”)'),
  })
  .refine((vals) => vals.numMCQ + vals.numTF + vals.numShort > 0, {
    message: 'Request at least one question of any type',
    path: ['numMCQ'],
  });

type QuizGeneratorValues = z.infer<typeof quizGeneratorSchema>;

const AIQuizGenerator = ({
  quizId,
  language,
  disabled,
}: {
  quizId: string;
  language: string;
  disabled: boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<QuizGeneratorValues>({
    resolver: zodResolver(quizGeneratorSchema),
    defaultValues: {
      numMCQ: 2,
      numTF: 2,
      numShort: 1,
      criteria: '',
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { isValid, isSubmitting },
    control,
  } = form;

  const handleGenerateQuiz = async (values: QuizGeneratorValues) => {
    setLoading(true);
    try {
      // 1. generate via AI
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...values, language }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Status ${res.status}`);
      }

      // 2. parse the structured JSON
      const { questions } = await res.json();
      // questions.mcq, questions.tf, questions.short

      // 3. batch up your createQuizQuestion calls
      const promises: Promise<unknown>[] = [];

      // MCQs
      for (const q of questions.mcq) {
        promises.push(
          createQuizQuestion({
            quizId,
            questionText: q.question,
            questionType: 'MCQ',
            options: q.options,
            correctAnswer: q.answer,
          })
        );
      }

      // True/False
      for (const q of questions.tf) {
        // Ensure your options match whatever your UI expects
        promises.push(
          createQuizQuestion({
            quizId,
            questionText: q.question,
            questionType: 'TRUE_FALSE',
            options: language === 'Arabic' ? ['صح', 'خظأ'] : ['True', 'False'],
            correctAnswer: q.answer,
          })
        );
      }

      // Short‑answer
      for (const q of questions.short) {
        promises.push(
          createQuizQuestion({
            quizId,
            questionText: q.question,
            questionType: 'SHORT_ANSWER',
          })
        );
      }

      // 4. wait for all DB writes, then notify
      await Promise.all(promises);
      toast.success('AI questions added to your quiz!');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(prev) => setOpen(prev)}>
      <DialogTrigger asChild>
        <Button
          disabled={loading || isSubmitting || disabled}
          className="flex items-center gap-2"
        >
          <Image src="/assets/ai.png" alt="AI icon" width={24} height={24} />
          <span>{loading ? 'Generating...' : 'Generate AI Quiz'}</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customize AI‑Generated Questions</DialogTitle>
          <DialogDescription>
            Choose how many of each type you’d like—then let AI fill them in.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={handleSubmit(handleGenerateQuiz)}
            className="mt-4 space-y-4"
          >
            {/* MCQ count */}
            <FormField
              control={control}
              name="numMCQ"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of MCQs</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min={0} max={50} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* True/False count */}
            <FormField
              control={control}
              name="numTF"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of True/False</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min={0} max={50} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Short Answer count */}
            <FormField
              control={control}
              name="numShort"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Short Answers</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min={0} max={50} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Criteria / guidance */}
            <FormField
              control={control}
              name="criteria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guidance / Topics</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. ‘inheritance, React hooks, async’"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-between">
              <DialogClose asChild>
                <Button variant="outline" disabled={loading || isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>

              <Button
                type="submit"
                disabled={!isValid || isSubmitting || loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2Icon className="animate-spin text-white" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  'Generate Quiz'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AIQuizGenerator;
