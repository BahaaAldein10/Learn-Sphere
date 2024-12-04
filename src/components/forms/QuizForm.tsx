'use client';

import { createQuiz } from '@/lib/actions/quiz.actions';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Course, Quiz } from '@prisma/client';
import { Pencil, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';

const formSchema = z.object({
  title: z
    .string()
    .min(2, { message: 'Title must be at least 2 characters long' })
    .max(50, { message: 'Title must be 50 characters or less' }),
});

interface QuizFormProps {
  initialData: Course & { quiz: Quiz | null };
  courseId: string;
}

const QuizForm = ({ initialData, courseId }: QuizFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const toggleCreate = () => {
    setIsCreating(!isCreating);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createQuiz({ courseId, title: values.title });

      toggleCreate();
      toast.success('Quiz created');
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong');
    }
  }

  return (
    <div className="relative mt-6 rounded-lg bg-gray-50 p-6 shadow-md">
      <div className="flex items-center justify-between text-lg font-semibold text-gray-700">
        Course Quizzes
        {!initialData.quiz && (
          <Button
            onClick={toggleCreate}
            variant="ghost"
            className="flex items-center gap-2 hover:text-purple-600"
          >
            {isCreating ? (
              <>Cancel</>
            ) : (
              <>
                <PlusCircle className="size-4" />
                Add a quiz
              </>
            )}
          </Button>
        )}
      </div>

      {isCreating && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="Enter quiz title"
                      {...field}
                      className="focus-visible:ring-purple-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-2">
              <Button
                disabled={!isValid || isSubmitting}
                type="submit"
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                Save
              </Button>

              <Button
                variant="ghost"
                onClick={toggleCreate}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      )}

      {!isCreating && (
        <div
          className={cn(
            'text-sm mt-2',
            !initialData.quiz && 'text-slate-500 italic'
          )}
        >
          {!initialData.quiz && 'No quizzes available.'}

          {initialData.quiz && (
            <div
              className={cn(
                `flex-between p-2 border rounded-md text-base font-semibold 
                ${
                  initialData.quiz?.isPublished
                    ? 'bg-purple-100 border-purple-100 text-purple-700'
                    : 'bg-gray-200 border-gray-200 text-gray-700'
                }`
              )}
            >
              <span>{initialData.quiz?.title}</span>

              <div className="flex items-center gap-2">
                <Badge
                  className={cn(
                    'select-none',
                    initialData.quiz?.isPublished
                      ? 'bg-primary'
                      : 'bg-slate-700'
                  )}
                >
                  {initialData.quiz?.isPublished ? 'Published' : 'Draft'}
                </Badge>

                <Pencil
                  onClick={async () => {
                    router.push(
                      `/teacher/courses/${courseId}/quiz/${initialData.quiz?.id}`
                    );
                  }}
                  className={`size-4 cursor-pointer transition ${initialData.quiz?.isPublished ? 'hover:text-purple-700' : 'hover:text-gray-700'} hover:opacity-75`}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizForm;
