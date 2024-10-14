'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { createAnswer } from '@/lib/actions/answer.actions';
import { useAuth } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import Editor from '../shared/Editor';

const formSchema = z.object({
  content: z
    .string()
    .min(30, 'Your answer must be at least 30 characters long.')
    .max(3000, 'Answer cannot exceed 3000 characters.'),
});

const AnswerForm = ({ questionId }: { questionId: string }) => {
  const { userId } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId) {
      toast.error('You need to be logged in to submit an answer.');
      return;
    }

    try {
      await createAnswer({
        userId,
        questionId,
        content: values.content,
      });

      toast.success('Answer created');
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
      console.error(error);
    }
  }

  return (
    <section className="mt-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Write your answer here</FormLabel>
                <FormControl>
                  <Editor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Share your knowledge and insights about the question"
                  />
                </FormControl>
                <FormDescription className="text-gray-600">
                  Write a detailed answer to provide helpful information and
                  explain your point of view.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-white" />
                Submitting
              </div>
            ) : (
              'Submit Your Answer'
            )}
          </Button>
        </form>
      </Form>
    </section>
  );
};

export default AnswerForm;
