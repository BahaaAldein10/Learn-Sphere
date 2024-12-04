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
import { Input } from '@/components/ui/input';
import { createCourse, findLastCourse } from '@/lib/actions/course.actions';
import { useAuth } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { redirect, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(50, { message: 'Name must be 50 characters or less' }),
});

const CreateCourse = () => {
  const router = useRouter();
  const { userId } = useAuth();

  if (!userId) redirect('/');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const { isSubmitting, isValid } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createCourse({
        clerkId: userId as string,
        courseName: values.name,
      });

      const course = await findLastCourse({
        clerkId: userId as string,
      });

      router.push(`/teacher/courses/${course?.id}`);
      toast.success('Course created');
    } catch (error) {
      toast.error('Something went wrong');
      console.log(error);
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-5xl p-6 md:items-center md:justify-center">
      <div>
        <h1 className="text-2xl font-semibold">Name your new course</h1>

        <p className="text-sm text-slate-600">
          What would you like to name your course? Don&apos;t worry, you can
          change this later.
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-8 space-y-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-black">
                    Course Name
                  </FormLabel>

                  <FormControl>
                    <Input
                      placeholder="e.g. 'Advanced web development'"
                      {...field}
                      className="focus-visible:ring-purple-700"
                    />
                  </FormControl>

                  <FormDescription>
                    What will you teach in this course?
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Link href="/teacher/courses">
                <Button variant="ghost" type="button">
                  Cancel
                </Button>
              </Link>

              <Button type="submit" disabled={isSubmitting || !isValid}>
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateCourse;
