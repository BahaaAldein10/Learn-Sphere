'use client';

import { updateChapterForm } from '@/lib/actions/chapter.actions';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import RichTextEditor from '../RichTextEditor/RichTextEditor';
import Preview from '../shared/Preview';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '../ui/form';

type Chapter = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  position: number;
  isPublished: boolean;
  isFree: boolean;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
};

const formSchema = z.object({
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters long' })
    .max(300, { message: 'Description must be 300 characters or less' }),
});

interface ChapterDescriptionFormProps {
  initialData: Chapter;
  courseId: string;
  chapterId: string;
}

const ChapterDescriptionForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterDescriptionFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData.description || '',
    },
  });

  const { isSubmitting, isValid } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
  }

  return (
    <div className="mt-6 rounded-lg bg-gray-50 p-6 shadow-md">
      <div className="flex items-center justify-between text-lg font-semibold text-gray-700">
        Chapter Description
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
              Edit Description
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <div
          className={cn(
            'text-sm mt-2',
            !initialData.description && 'text-slate-500 italic'
          )}
        >
          {!initialData.description && 'No description'}
          {initialData.description && (
            <Preview value={initialData.description} />
          )}
        </div>
      )}

      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RichTextEditor {...field} />
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

export default ChapterDescriptionForm;
