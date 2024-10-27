'use client';

import { updateCourse } from '@/lib/actions/course.actions';
import { ImageIcon, Pencil, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { z } from 'zod';
import FileUpload from '../shared/FileUpload';
import { Button } from '../ui/button';

type Course = {
  id: string;
  clerkId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  isPublished: boolean;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formSchema = z.object({
  imageUrl: z.string().url('Invalid URL format'),
});

interface ImageFormProps {
  initialData: Course;
  courseId: string;
}

const ImageForm = ({ initialData, courseId }: ImageFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateCourse({
        id: courseId,
        userId: initialData.clerkId,
        values,
      });

      toggleEdit();
      toast.success('Course updated');
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    }
  }

  return (
    <div className="mt-6 rounded-lg bg-slate-50 p-6 shadow-md">
      <div className="flex items-center justify-between text-lg font-semibold text-gray-700">
        Course image
        <Button
          onClick={toggleEdit}
          variant="ghost"
          className="hover:text-purple-600"
        >
          {isEditing && <>Cancel</>}
          {!isEditing && !initialData.imageUrl && (
            <>
              <PlusCircle className="mr-2 size-4" />
              Add an image
            </>
          )}
          {!isEditing && initialData.imageUrl && (
            <>
              <Pencil className="mr-2 size-4" />
              Edit Image
            </>
          )}
        </Button>
      </div>

      {!isEditing &&
        (!initialData.imageUrl ? (
          <div className="mt-4 flex h-60 items-center justify-center rounded-md bg-slate-200">
            <ImageIcon className="size-10 text-slate-500" />
          </div>
        ) : (
          <div className="relative mt-4 aspect-video">
            <Image
              alt="Upload"
              fill
              className="rounded-md object-cover"
              src={initialData.imageUrl}
              loading="lazy"
            />
          </div>
        ))}

      {isEditing && (
        <div>
          <FileUpload
            endpoint="courseImage"
            onChange={(url) => {
              if (url) {
                onSubmit({ imageUrl: url });
              }
            }}
          />
          <div className="mt-4 text-xs">16:9 aspect ratio recommended</div>
        </div>
      )}
    </div>
  );
};

export default ImageForm;
