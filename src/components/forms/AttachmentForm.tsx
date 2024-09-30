'use client';

import {
  createAttachment,
  deleteAttachment,
} from '@/lib/actions/course.actions';
import { File, Loader2, PlusCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { z } from 'zod';
import FileUpload from '../shared/FileUpload';
import { Button } from '../ui/button';

type Attachment = {
  id: string;
  name: string;
  url: string;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
};

const formSchema = z.object({
  url: z
    .string()
    .min(1, { message: 'URL is required.' })
    .url({ message: 'Invalid URL format.' }),
  // originalFilename: z
  //   .string()
  //   .min(1, { message: 'Original filename is required.' }),
});

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

interface AttachmentFormProps {
  initialData: Course & { attachments: Attachment[] };
  courseId: string;
}

const AttachmentForm = ({ initialData, courseId }: AttachmentFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createAttachment({
        courseId,
        url: values.url,
      });

      toggleEdit();
      toast.success('Attachment created');
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
    }
  }

  async function onDelete(id: string) {
    try {
      setDeletingId(id);

      await deleteAttachment({
        attachmentId: id,
        courseId,
      });

      toast.success('Attachment deleted');
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mt-6 rounded-lg bg-slate-50 p-6 shadow-md">
      <div className="flex items-center justify-between text-lg font-semibold text-gray-700">
        Course Attachments
        <Button
          onClick={toggleEdit}
          variant="ghost"
          className="hover:text-purple-600"
        >
          {isEditing && <>Cancel</>}
          {!isEditing && (
            <>
              <PlusCircle className="mr-2 size-4" />
              Add a file
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <>
          {initialData.attachments.length === 0 && (
            <p className="mt-2 text-sm italic text-slate-500">
              No attachments yet
            </p>
          )}
          {initialData.attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {initialData.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex w-full items-center justify-between rounded-md border border-sky-200 bg-sky-100 p-3 text-sky-700"
                >
                  <div className="flex items-center">
                    <File className="mr-2 size-4 shrink-0" />
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="line-clamp-1 text-xs hover:underline"
                    >
                      {attachment.name}
                    </a>
                  </div>

                  <div>
                    {deletingId === attachment.id ? (
                      <Loader2 className="float-right size-4 animate-spin" />
                    ) : (
                      <button
                        title="Delete attachment"
                        onClick={() => onDelete(attachment.id)}
                        className="ml-auto transition hover:opacity-75"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {isEditing && (
        <div>
          <FileUpload
            endpoint="courseAttachment"
            onChange={(url) => {
              if (url) {
                onSubmit({ url });
              }
            }}
          />

          <div className="mt-4 text-xs">
            Add anything your students might need to complete the course.
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentForm;
