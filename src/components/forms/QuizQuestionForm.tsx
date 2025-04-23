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
} from '@/lib/actions/quiz.actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { QuizOption, QuizQuestion } from '@prisma/client';
import { ArrowLeft, Edit3, Pencil, Trash, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import AIQuizGenerator from '../shared/AIQuizGenerator';
import ConfirmModal from '../shared/ConfirmModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import QuizActions from './QuizActions';
import QuizConfigurationForm from './QuizConfigurationForm';

const questionSchema = z
  .object({
    questionText: z
      .string()
      .min(5, 'Question must be at least 5 characters long'),
    questionType: z
      .string()
      .min(1, 'Please select a question type')
      .refine((val) => ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER'].includes(val), {
        message: 'Invalid question type',
      }),
    options: z
      .array(
        z.string().min(2, 'At least two characters are required for an option')
      )
      .max(4, 'At most four options are allowed')
      .optional(),
    correctAnswer: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.questionType !== 'SHORT_ANSWER') {
      if (!data.options || data.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least two options are required',
          path: ['options'],
        });
      }
      if (!data.correctAnswer) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select a correct answer',
          path: ['correctAnswer'],
        });
      } else if (!data.options?.includes(data.correctAnswer)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Correct answer must be one of the options',
          path: ['correctAnswer'],
        });
      }
    }
  });

type QuestionFormValues = z.infer<typeof questionSchema>;
interface QuizQuestionFormProps {
  quizTitle: string;
  courseId: string;
  quizId: string;
  questions: (QuizQuestion & { options: QuizOption[] })[];
  isPublished: boolean;
  language: string;
  time: number;
  weightMCQ: number;
  weightTF: number;
  weightShort: number;
  criteria: string;
}

const QuizQuestionForm = ({
  quizTitle,
  courseId,
  quizId,
  questions,
  isPublished,
  language,
  time,
  weightMCQ,
  weightTF,
  weightShort,
  criteria,
}: QuizQuestionFormProps) => {
  const router = useRouter();
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [isChanged, setIsChanged] = useState(false);

  const hasQuestion = questions.some(Boolean);
  const hasRequiredConfig =
    !!language &&
    !!time &&
    !!weightMCQ &&
    !!weightTF &&
    !!weightShort &&
    !!criteria;

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    mode: 'onChange',
    defaultValues: {
      questionText: '',
      questionType: '',
      options: [],
      correctAnswer: '',
    },
  });

  const { handleSubmit, formState, reset, setValue, watch } = form;
  const { isSubmitting } = formState;

  const watchedText = watch('questionText');
  const watchedType = watch('questionType');
  const watchedOptions = watch('options');
  const watchedCorrectAnswer = watch('correctAnswer');

  useEffect(() => {
    if (editingQuestionId) {
      const question = questions.find((q) => q.id === editingQuestionId);

      const hasContentChanged = question?.content !== watchedText;
      const hasTypeChanged = question?.type !== watchedType;
      const optionsChanged =
        question?.options.map((opt) => opt.content).join(',') !==
        watchedOptions?.join(',');
      const answerChanged =
        question?.options.find((opt) => opt.isCorrect)?.content !==
        watchedCorrectAnswer;

      setIsChanged(
        hasContentChanged || hasTypeChanged || optionsChanged || answerChanged
      );
    }
  }, [
    editingQuestionId,
    questions,
    watchedText,
    watchedType,
    watchedOptions,
    watchedCorrectAnswer,
  ]);

  const resetFields = () => {
    reset({
      questionText: '',
      questionType: '',
      options: [],
      correctAnswer: '',
    });
    setEditingQuestionId(null);
  };

  const handleAddOrUpdateQuestion = async (values: QuestionFormValues) => {
    const payload = {
      quizId,
      questionText: values.questionText,
      questionType: values.questionType,
      options:
        values.questionType !== 'SHORT_ANSWER'
          ? values.options || []
          : undefined,
      correctAnswer:
        values.questionType !== 'SHORT_ANSWER'
          ? (values.correctAnswer ?? '')
          : undefined,
    };

    try {
      if (editingQuestionId) {
        await updateQuizQuestion({ questionId: editingQuestionId, ...payload });
        toast.success('Question updated successfully!');
        setEditingQuestionId(null);
      } else {
        await createQuizQuestion(payload);
        toast.success('Question added successfully!');
      }
      resetFields();
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
    reset({
      questionText: question.content,
      questionType: question.type,
      options:
        question.type !== 'SHORT_ANSWER'
          ? (question.options.map((opt) => opt.content) as string[])
          : [],
      correctAnswer:
        question.type !== 'SHORT_ANSWER'
          ? question.options.find((opt) => opt.isCorrect)?.content || ''
          : '',
    });
    window.scrollTo({ top: isPublished ? 800 : 850, behavior: 'smooth' });
  };

  const arabicTextClasses =
    language === 'Arabic' ? 'text-sm font-arabic font-semibold' : '';

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
          disabled={!hasRequiredConfig || !hasQuestion}
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

        <QuizConfigurationForm
          quizTitle={quizTitle}
          quizId={quizId}
          language={language}
          time={time}
          defaultWeightMCQ={weightMCQ}
          defaultWeightTF={weightTF}
          defaultWeightShort={weightShort}
          criteria={criteria}
        />

        {!hasRequiredConfig && (
          <div className="mt-4 rounded-md border-l-4 border-yellow-400 bg-yellow-50 p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <svg
                className="size-5 shrink-0 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M12 9v2m0 4h.01M12 5.5a7.5 7.5 0 017.5 7.5 7.5 7.5 0 11-15 0 7.5 7.5 0 017.5-7.5z"
                />
              </svg>

              <div className="space-y-2 text-sm text-yellow-900">
                <p className="font-medium">Complete quiz configuration</p>
                <p>
                  To get the <strong>best AI experience</strong> and to be able
                  to <strong>publish your quiz</strong>, please select a
                  language, time, weights, and criteria above.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-between mt-6">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-purple-200 p-1">
              <Edit3 color="#581c87" className="size-6" />
            </div>
            <h2 className="text-xl font-medium">Generate or Add Questions</h2>
          </div>

          <AIQuizGenerator
            quizId={quizId}
            language={language}
            disabled={!hasRequiredConfig}
          />
        </div>

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
                      <Input
                        {...field}
                        placeholder="Enter the question"
                        className={
                          language === 'Arabic' ? arabicTextClasses : ''
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="questionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value: string) => {
                        field.onChange(value);
                        reset({
                          questionText: watch('questionText'),
                          questionType: value,
                          options:
                            value === 'MCQ'
                              ? ['', '', '', '']
                              : value === 'TRUE_FALSE'
                                ? language === 'English'
                                  ? ['True', 'False']
                                  : ['صح', 'خطأ']
                                : [],
                          correctAnswer: '',
                        });
                      }}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={
                            language === 'Arabic' ? arabicTextClasses : ''
                          }
                        >
                          <SelectValue placeholder="Select Question Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          value="MCQ"
                          className={
                            language === 'Arabic' ? arabicTextClasses : ''
                          }
                        >
                          {language === 'English' ? 'MCQ' : 'إختيار متعدد'}
                        </SelectItem>
                        <SelectItem
                          value="TRUE_FALSE"
                          className={arabicTextClasses}
                        >
                          {language === 'English' ? 'True/False' : 'صح/خطأ'}
                        </SelectItem>
                        <SelectItem
                          value="SHORT_ANSWER"
                          className={arabicTextClasses}
                        >
                          {language === 'English'
                            ? 'Short Answer'
                            : 'إجابة قصيرة'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedType && watchedType !== 'SHORT_ANSWER' && (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <FormLabel>Options</FormLabel>
                      {watch('options')?.map((_, index) => (
                        <div
                          key={index}
                          className={`flex items-center space-x-2 ${language === 'Arabic' && arabicTextClasses}`}
                        >
                          <FormControl>
                            {watchedType === 'MCQ' ? (
                              <div className="flex-center grow gap-4">
                                <Input
                                  {...form.register(`options.${index}`)}
                                  placeholder={`Option ${index + 1}`}
                                  className="flex-1"
                                />
                                <X
                                  className="size-6 cursor-pointer text-red-600"
                                  onClick={() => {
                                    const updatedOptions = form
                                      .watch('options')
                                      ?.filter((_, idx) => index !== idx);
                                    setValue('options', updatedOptions);
                                  }}
                                />
                              </div>
                            ) : (
                              <Input
                                {...form.register(`options.${index}`)}
                                placeholder={`Option ${index + 1}`}
                                readOnly
                                className="cursor-context-menu"
                              />
                            )}
                          </FormControl>
                        </div>
                      ))}
                    </div>

                    {watchedType === 'MCQ' &&
                      (watch('options')?.length ?? 0) < 4 && (
                        <Button
                          type="button"
                          onClick={() => {
                            setValue('options', [
                              ...(watch('options') || []),
                              '',
                            ]);
                          }}
                          className="mt-4"
                        >
                          Add Option
                        </Button>
                      )}
                  </div>

                  <FormField
                    control={form.control}
                    name="correctAnswer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correct Answer</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={
                            form
                              .watch('options')
                              ?.some((option) => option.trim() === '') ||
                            watch('options')?.length === 0
                          }
                        >
                          <FormControl>
                            <SelectTrigger
                              className={
                                language === 'Arabic' ? arabicTextClasses : ''
                              }
                            >
                              <SelectValue placeholder="Select Correct Answer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent
                            className={
                              language === 'Arabic' ? arabicTextClasses : ''
                            }
                          >
                            {form
                              .watch('options')
                              ?.filter((option) => option.trim() !== '')
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
                </>
              )}

              <div className="flex items-center gap-2">
                {editingQuestionId && (
                  <Button type="submit" disabled={isSubmitting || !isChanged}>
                    Update Question
                  </Button>
                )}
                {!editingQuestionId && (
                  <Button type="submit" disabled={isSubmitting}>
                    Add Question
                  </Button>
                )}
                {editingQuestionId && (
                  <Button
                    disabled={isSubmitting}
                    onClick={() => {
                      resetFields();
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
                      <Button size="icon" onClick={() => handleEditQuestion(q)}>
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
                  {q.type !== 'SHORT_ANSWER' && (
                    <>
                      <ul className="ml-5 list-disc">
                        {q.options.map((option, i) => (
                          <li key={i}>{option.content}</li>
                        ))}
                      </ul>
                      <p className="font-semibold">
                        Correct Answer:{' '}
                        {q.options.find((option) => option.isCorrect)?.content}
                      </p>
                    </>
                  )}
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
