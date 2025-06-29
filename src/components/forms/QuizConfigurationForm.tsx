'use client';

import { updateQuizConfiguration } from '@/lib/actions/quiz.actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';

interface QuizConfigurationFormProps {
  quizTitle: string;
  quizId: string;
  language: string;
  time: number;
  defaultWeightMCQ: number;
  defaultWeightTF: number;
  defaultWeightShort: number;
  criteria: string;
}

const formSchema = z.object({
  title: z
    .string()
    .min(2, { message: 'Quiz title must be at least 2 characters long' })
    .max(50, { message: 'Quiz title must be 50 characters or less' }),
  language: z.string().min(1, 'Please select a language'),
  timeInMinutes: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val) : val),
    z
      .number({ invalid_type_error: 'Time must be a number' })
      .min(1, 'Time must be at least 1 minute')
      .max(120, 'Time must be 120 minutes or less')
  ),
  defaultWeightMCQ: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0.1, { message: 'Weight must be at least 0.1' })
  ),
  defaultWeightTF: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0.1, { message: 'Weight must be at least 0.1' })
  ),
  defaultWeightShort: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0.1, { message: 'Weight must be at least 0.1' })
  ),
  criteria: z
    .string()
    .min(5, { message: 'Please define criteria for short-answer questions' })
    .max(2000, { message: 'Description must be 1000 characters or less' }),
});

type FormValues = z.infer<typeof formSchema>;

const QuizConfigurationForm = ({
  quizTitle,
  quizId,
  language,
  time,
  defaultWeightMCQ,
  defaultWeightTF,
  defaultWeightShort,
  criteria,
}: QuizConfigurationFormProps) => {
  const [isUnchanged, setIsUnchanged] = useState(true);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: quizTitle,
      language,
      timeInMinutes: time,
      defaultWeightMCQ,
      defaultWeightTF,
      defaultWeightShort,
      criteria,
    },
  });

  const { isSubmitting } = form.formState;
  const { reset, watch } = form;

  const watchedTitle = watch('title');
  const watchedLanguage = watch('language');
  const watchedTime = watch('timeInMinutes');
  const watchedMCQ = watch('defaultWeightMCQ');
  const watchedTF = watch('defaultWeightTF');
  const watchedShort = watch('defaultWeightShort');
  const watchedCriteria = watch('criteria');

  useEffect(() => {
    const unchanged =
      quizTitle === watchedTitle &&
      language === watchedLanguage &&
      Number(time) === Number(watchedTime) &&
      Number(defaultWeightMCQ) === Number(watchedMCQ) &&
      Number(defaultWeightTF) === Number(watchedTF) &&
      Number(defaultWeightShort) === Number(watchedShort) &&
      criteria.trim() === watchedCriteria.trim();

    setIsUnchanged(unchanged);
  }, [
    watchedTitle,
    watchedLanguage,
    watchedTime,
    watchedMCQ,
    watchedTF,
    watchedShort,
    watchedCriteria,
    quizTitle,
    language,
    time,
    defaultWeightMCQ,
    defaultWeightTF,
    defaultWeightShort,
    criteria,
  ]);

  const onSubmit = async (values: FormValues) => {
    try {
      await updateQuizConfiguration({
        quizId,
        quizTitle: values.title,
        language: values.language,
        time: values.timeInMinutes,
        defaultWeightMCQ: values.defaultWeightMCQ,
        defaultWeightTF: values.defaultWeightTF,
        defaultWeightShort: values.defaultWeightShort,
        criteria: values.criteria,
      });

      reset(values);
      toast.success('Quiz updated successfully!');
      router.refresh();
    } catch {
      toast.error('An error occurred while updating the quiz.');
    }
  };

  return (
    <div className="mt-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <Label>Quiz Title</Label>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    placeholder="Enter quiz title (e.g. 'Advanced Web Development')"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="mt-1 text-red-600" />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-4 sm:flex-row">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Label>Language</Label>
                  <FormControl>
                    <Select
                      value={field.value || ''}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Arabic">Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="mt-1 text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeInMinutes"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Label>Time (minutes)</Label>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      type="number"
                      placeholder="Enter time in minutes"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="mt-1 text-red-600" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="defaultWeightMCQ"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MCQ Weight</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 1.0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultWeightTF"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>True/False Weight</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 0.5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultWeightShort"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short-Answer Weight</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 2.0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="criteria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short-Answer Criteria</FormLabel>
                <FormControl>
                  <Textarea
                    rows={10}
                    disabled={isSubmitting}
                    placeholder="Describe how short answers will be evaluated (e.g., clarity, completeness, accuracy, use of keywords)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={isSubmitting || isUnchanged} type="submit">
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-white" />
                <span>Saving...</span>
              </div>
            ) : (
              'Save Changes'
            )}
          </Button>

          {/* Inline Feedback Message */}
          {isUnchanged && (
            <p className="text-sm text-gray-500">
              No changes detected. Please modify a field to enable saving.
            </p>
          )}
        </form>
      </Form>
    </div>
  );
};

export default QuizConfigurationForm;
