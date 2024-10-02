'use client';

import { updateChapterForm } from '@/lib/actions/chapter.actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, X } from 'lucide-react';
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
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';

interface ChapterTitleFormProps {
  initialData: { title: string };
  courseId: string;
  chapterId: string;
}

const formSchema = z.object({
  title: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(50, { message: 'Name must be 50 characters or less' }),
});

const ChapterTitleForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterTitleFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateChapterForm({
        chapterId,
        courseId,
        values,
      });
      toggleEdit();
      toast.success('Chapter updated');
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="mt-6 rounded-lg bg-slate-50 p-6 shadow-md">
      <div className="flex items-center justify-between text-lg font-semibold text-gray-700">
        <span>Chapter Name</span>
        <Button
          onClick={toggleEdit}
          variant="ghost"
          className="flex items-center gap-2 hover:text-purple-600"
        >
          {isEditing ? (
            <>
              <X className="size-4" />
              Cancel
            </>
          ) : (
            <>
              <Pencil className="size-4" />
              Edit Name
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <p className="mt-2 text-sm text-gray-600">{initialData?.title}</p>
      )}

      {isEditing && (
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
                      placeholder="e.g. 'Advanced Web Development'"
                      {...field}
                      className="focus-visible:ring-purple-700"
                    />
                  </FormControl>
                  <FormMessage className="mt-1 text-red-600" />{' '}
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
                onClick={toggleEdit}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default ChapterTitleForm;
