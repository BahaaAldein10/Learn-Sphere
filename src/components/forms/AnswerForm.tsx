'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { createAnswer } from '@/lib/actions/answer.actions';
import { useAuth } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import RichTextEditor from '../RichTextEditor/RichTextEditor';

const formSchema = z.object({
  content: z
    .string()
    .min(30, 'Your answer must be at least 30 characters long.')
    .max(5000, 'Answer cannot exceed 3000 characters.'),
});

const AnswerForm = ({
  questionId,
  questionTitle,
}: {
  questionId: string;
  questionTitle: string;
}) => {
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const router = useRouter();
  const { userId } = useAuth();

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
      setLoadingSubmit(true);

      await createAnswer({
        userId,
        questionId,
        content: values.content,
      });

      toast.success('Answer created');

      form.reset({ content: '' });
      form.clearErrors();
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
      console.error(error);
    } finally {
      setLoadingSubmit(false);
    }
  }

  const handleGenerateAnswer = async () => {
    try {
      setLoadingGenerate(true);

      const res = await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application.json' },
        body: JSON.stringify({ question: questionTitle }),
      });

      if (!res.ok) {
        return toast.error('An unexpected error occurred.');
      }

      const data = await res.json();
      form.setValue('content', data.response);
      form.clearErrors();
    } catch {
      toast.error('Failed to connect to the server. Please try again later.');
    } finally {
      setLoadingGenerate(false);
    }
  };

  return (
    <section className="mt-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <div className="flex-between mb-4">
                  <h1>Write your answer here</h1>
                  <Button
                    className="gap-1"
                    onClick={(e) => {
                      e.preventDefault();
                      handleGenerateAnswer();
                    }}
                    disabled={loadingGenerate || loadingSubmit}
                  >
                    <Image
                      src="/assets/ai.png"
                      alt="ai"
                      width={24}
                      height={24}
                    />
                    <span>
                      {loadingGenerate ? 'Generating...' : 'Generate Answer'}
                    </span>
                  </Button>
                </div>
                <FormControl>
                  <RichTextEditor
                    content={field.value}
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

          <Button type="submit" disabled={loadingSubmit || loadingGenerate}>
            {loadingSubmit ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-white" />
                Submitting...
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
