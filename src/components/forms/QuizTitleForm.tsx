'use client';

import { updateQuizTitle } from '@/lib/actions/quiz.actions';
import { zodResolver } from '@hookform/resolvers/zod';
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

interface QuizTitleFormProps {
  quizTitle: string;
  quizId: string;
}

const formSchema = z.object({
  title: z
    .string()
    .min(2, { message: 'Title must be at least 2 characters long' })
    .max(50, { message: 'Title must be 50 characters or less' }),
});

const QuizTitleForm = ({ quizTitle, quizId }: QuizTitleFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: quizTitle,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const isUnchanged = quizTitle === form.watch().title;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateQuizTitle({
        quizId,
        quizTitle: values.title,
      });

      toast.success('Quiz updated successfully!');
      router.refresh();
    } catch {
      toast.error('Something went wrong.');
    }
  };

  return (
    <div className="mt-6">
      <h1 className="text-lg font-semibold text-gray-700">Quiz Title</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-2 space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    placeholder="e.g. 'Advanced Web Development'"
                    {...field}
                    className="focus-visible:ring-purple-700"
                  />
                </FormControl>
                <FormMessage className="mt-1 text-red-600" />{' '}
              </FormItem>
            )}
          />

          <Button
            disabled={!isValid || isSubmitting || isUnchanged}
            type="submit"
            className="bg-purple-600 text-white hover:bg-purple-600/90"
          >
            Save
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default QuizTitleForm;
