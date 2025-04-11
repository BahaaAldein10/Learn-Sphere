'use client';

import { updateQuizConfiguration } from '@/lib/actions/quiz.actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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

interface QuizConfigurationFormProps {
  quizTitle: string;
  quizId: string;
  language: string;
  time: number;
}

const formSchema = z.object({
  title: z
    .string()
    .min(2, { message: 'Quiz title must be at least 2 characters long' })
    .max(50, { message: 'Quiz title must be 50 characters or less' }),
  language: z.string().min(1, 'Please select a language'),
  timeInMinutes: z.preprocess(
    (val) => {
      if (typeof val === 'string') return parseInt(val, 10);
      return val;
    },
    z
      .number({ invalid_type_error: 'Time must be a number' })
      .min(1, 'Time must be at least 1 minute')
      .max(120, 'Time must be 120 minutes or less')
  ),
});

const QuizConfigurationForm = ({
  quizTitle,
  quizId,
  language,
  time,
}: QuizConfigurationFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: quizTitle,
      language,
      timeInMinutes: time,
    },
  });

  const { isSubmitting } = form.formState;

  const isUnchanged =
    quizTitle === form.watch().title &&
    language === form.watch('language') &&
    time === form.watch('timeInMinutes');

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateQuizConfiguration({
        quizId,
        quizTitle: values.title,
        language: values.language,
        time: values.timeInMinutes,
      });

      form.reset({
        title: values.title,
        language: values.language,
        timeInMinutes: values.timeInMinutes,
      });

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
          {/* Quiz Title Field */}
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

          {/* Language & Time Fields in a Single Row */}
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Language Select */}
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Label>Language</Label>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English" className="cursor-pointer">
                          English
                        </SelectItem>
                        <SelectItem value="Arabic" className="cursor-pointer">
                          Arabic
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="mt-1 text-red-600" />
                </FormItem>
              )}
            />

            {/* Time Input */}
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
        </form>
      </Form>
    </div>
  );
};

export default QuizConfigurationForm;
