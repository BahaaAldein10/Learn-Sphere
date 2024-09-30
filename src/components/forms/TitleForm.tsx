'use client';

import { updateCourse } from '@/lib/actions/course.actions';
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

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(50, { message: 'Name must be 50 characters or less' }),
});

interface TitleFormProps {
  initialData: {
    name: string;
    clerkId: string;
  };
  courseId: string;
}

const TitleForm = ({ initialData, courseId }: TitleFormProps) => {
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
      await updateCourse({
        id: courseId,
        userId: initialData.clerkId,
        values,
      });
      toggleEdit();
      toast.success('Course updated');
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="mt-6 rounded-lg bg-slate-50 p-6 shadow-md">
      <div className="flex items-center justify-between text-lg font-semibold text-gray-700">
        <span>Course Name</span>
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
        <p className="mt-2 text-sm text-gray-600">{initialData?.name}</p>
      )}

      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
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

export default TitleForm;
