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
import {
  createQuestion,
  getCategoryIdByName,
} from '@/lib/actions/question.actions';
import { useAuth } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { Category } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import RichTextEditor from '../RichTextEditor/RichTextEditor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const formSchema = z.object({
  title: z
    .string()
    .min(15, 'Title must be at least 15 characters long')
    .max(150, 'Title cannot exceed 150 characters'),

  description: z
    .string()
    .min(30, 'Description must be at least 30 characters long')
    .max(3000, 'Description cannot exceed 3000 characters'),
  category: z.string().min(1, 'Please select a category'),
});

interface AskQuestionFormProps {
  categories: Category[];
}

const AskQuestionForm = ({ categories }: AskQuestionFormProps) => {
  const { userId } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const categoryId = await getCategoryIdByName({
        categoryName: values.category,
      });

      if (!categoryId || !userId) {
        toast.error('An error occurred. Please try again.');
        return;
      }

      await createQuestion({
        values: {
          title: values.title,
          description: values.description,
          categoryId,
          clerkId: userId,
        },
      });

      toast.success('Question created');
      router.push('/forum');
    } catch (error) {
      toast.error('Something went wrong.');
      console.error(error);
    }
  }

  return (
    <section className="max-w-screen-md space-y-6 p-5 sm:p-10">
      <h1 className="text-2xl font-semibold">Ask a Question</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Title Field */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Question Title <span className="text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="E.g. How to implement authentication in Next.js?"
                    {...field}
                    aria-required="true"
                  />
                </FormControl>
                <FormDescription className="text-purple-600">
                  Be specific and imagine you&apos;re asking another person.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description Field */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Question Description <span className="text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <RichTextEditor
                    content={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription className="text-purple-600">
                  Introduce the problem and expand on what you put in the title.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category Field */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Question Category <span className="text-red-600">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription className="text-purple-600">
                  Please select the category that best fits your question.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            {form.formState.isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-white" />
                Submitting
              </div>
            ) : (
              'Submit'
            )}
          </Button>
        </form>
      </Form>
    </section>
  );
};

export default AskQuestionForm;
