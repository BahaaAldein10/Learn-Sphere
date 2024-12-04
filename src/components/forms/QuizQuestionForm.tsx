'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  createQuizQuestion,
  deleteQuizQuestion,
  updateQuizQuestion,
} from '@/lib/actions/quiz.actions'; // Add update and delete actions
import { zodResolver } from '@hookform/resolvers/zod';
import { QuizOption, QuizQuestion } from '@prisma/client';
import { ArrowLeft, Edit3, Pencil, Trash } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import ConfirmModal from '../shared/ConfirmModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import QuizActions from './QuizActions';
import QuizTitleForm from './QuizTitleForm';

const questionSchema = z.object({
  questionText: z
    .string()
    .min(5, 'Question must be at least 5 characters long'),
  options: z.array(z.string().min(1, 'Option cannot be empty')).length(4),
  correctAnswer: z.string().min(1, 'Please select a correct answer'),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

const QuizQuestionForm = ({
  quizTitle,
  courseId,
  quizId,
  questions,
  isPublished,
}: {
  quizTitle: string;
  courseId: string;
  quizId: string;
  questions: (QuizQuestion & { options: QuizOption[] })[];
  isPublished: boolean;
}) => {
  const router = useRouter();
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );

  const hasQuestion = questions.some(Boolean);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
    },
  });

  const { handleSubmit, formState, reset, setValue } = form;
  const { isSubmitting, isValid } = formState;

  const handleAddOrUpdateQuestion = async (values: QuestionFormValues) => {
    try {
      if (editingQuestionId) {
        // Update existing question
        await updateQuizQuestion({
          questionId: editingQuestionId,
          correctAnswer: values.correctAnswer,
          questionText: values.questionText,
          options: values.options,
        });
        toast.success('Question updated successfully!');
        setEditingQuestionId(null);
      } else {
        // Add new question
        await createQuizQuestion({
          correctAnswer: values.correctAnswer,
          questionText: values.questionText,
          options: values.options,
          quizId,
        });
        toast.success('Question added successfully!');
      }
      reset();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong.');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteQuizQuestion({ questionId: id });
      toast.success('Question deleted successfully!');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete question.');
    }
  };

  const handleEditQuestion = (
    question: QuizQuestion & { options: QuizOption[] }
  ) => {
    setEditingQuestionId(question.id);
    setValue('questionText', question.content);
    setValue(
      'options',
      question.options.map((option) => option.content)
    );
    setValue(
      'correctAnswer',
      question.options.find((option) => option.isCorrect)?.content || ''
    );

    window.scrollTo({ top: isPublished ? 120 : 180, behavior: 'smooth' });
  };

  return (
    <div className="p-6">
      <div className="flex-between mb-6 w-full">
        <Link
          href={`/teacher/courses/${courseId}`}
          className="flex w-fit items-center text-sm transition hover:opacity-75"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to course setup
        </Link>

        <QuizActions
          disabled={!hasQuestion}
          courseId={courseId}
          quizId={quizId}
          isPublished={isPublished}
        />
      </div>

      <h1 className="text-2xl font-medium">Manage Quiz Questions</h1>

      <div className="mt-6 max-w-[50rem]">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-purple-200 p-1">
            <Edit3 color="#581c87" className="size-6" />
          </div>
          <h2 className="text-xl font-medium">Customize your quiz</h2>
        </div>

        <QuizTitleForm quizTitle={quizTitle} quizId={quizId} />

        <div className="space-y-6">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(handleAddOrUpdateQuestion)}
              className="mt-6 space-y-4"
            >
              <FormField
                control={form.control}
                name="questionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter the question" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormLabel>Options</FormLabel>
                {form.watch('options').map((_, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <FormControl>
                      <Input
                        {...form.register(`options.${index}`)}
                        placeholder={`Option ${index + 1}`}
                      />
                    </FormControl>
                  </div>
                ))}
              </div>

              {/* Correct Answer */}
              <FormField
                control={form.control}
                name="correctAnswer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correct Answer</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={form
                        .watch('options')
                        .some((option) => option.trim() === '')}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Correct Answer" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {form
                          .watch('options')
                          .filter((option) => option.trim() !== '')
                          .map((option, index) => (
                            <SelectItem key={index} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-2">
                <Button type="submit" disabled={!isValid || isSubmitting}>
                  {editingQuestionId ? 'Update Question' : 'Add Question'}
                </Button>

                {editingQuestionId && (
                  <Button
                    onClick={() => {
                      form.reset();
                      setEditingQuestionId(null);
                    }}
                  >
                    Clear Questions
                  </Button>
                )}
              </div>
            </form>
          </Form>

          {/* Added Questions */}
          {questions.length > 0 && (
            <div className="mt-6 space-y-2">
              <h2 className="text-xl font-medium">Added Questions:</h2>
              {questions.map((q, idx) => (
                <div key={idx} className="rounded border bg-gray-100 p-4">
                  <div className="flex-between">
                    <h3 className="font-semibold">{`Q${idx + 1}: ${q.content}`}</h3>

                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        onClick={() => {
                          handleEditQuestion(q);
                        }}
                      >
                        <Pencil className="size-5" />
                      </Button>

                      <ConfirmModal
                        type="Question"
                        onDelete={() => handleDeleteQuestion(q.id)}
                      >
                        <Button variant="destructive" size="icon">
                          <Trash className="size-5" />
                        </Button>
                      </ConfirmModal>
                    </div>
                  </div>

                  <ul className="ml-5 list-disc">
                    {q.options.map((option, i) => (
                      <li key={i}>{option.content}</li>
                    ))}
                  </ul>

                  <p className="font-semibold">
                    Correct Answer:{' '}
                    {q.options.find((option) => option.isCorrect)?.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizQuestionForm;
