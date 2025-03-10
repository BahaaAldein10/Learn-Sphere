'use client';

import { QuizOption, QuizQuestion } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface QuizInterfaceProps {
  quizTitle: string;
  questions: (QuizQuestion & { options: QuizOption[] })[];
  language: string;
}

const QuizInterface = ({
  quizTitle,
  questions,
  language,
}: QuizInterfaceProps) => {
  const TOTAL_TIME = questions.length * 60;

  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiEvaluations, setAiEvaluations] = useState<
    Record<string, { score: number; feedback: string }>
  >({});

  const getReviewClass = (q: QuizQuestion & { options: QuizOption[] }) => {
    if (q.options.length > 0) {
      return selectedAnswers[q.id] === correctAnswers[q.id]
        ? 'border-green-400 bg-green-100'
        : 'border-red-400 bg-red-100';
    } else {
      return aiEvaluations[q.id] && aiEvaluations[q.id].score >= 0.7
        ? 'border-green-400 bg-green-100'
        : 'border-red-400 bg-red-100';
    }
  };

  const correctAnswers = Object.fromEntries(
    questions.map((q) => [
      q.id,
      q.options.find((opt) => opt.isCorrect)?.id ?? '',
    ])
  );

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage =
    ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    if (!quizStarted || quizSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);

    if (timeRemaining === 0) {
      clearInterval(timer);

      setTimeout(() => toast('⏳ Time is up! Submitting...'), 0);

      setTimeout(handleSubmit, 2000);
    }

    return () => clearInterval(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizStarted, timeRemaining, quizSubmitted]);

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    let calculatedScore = 0;
    const updatedEvaluations: Record<
      string,
      { score: number; feedback: string }
    > = {};

    const shortAnswerQuestions = questions
      .filter((q) => q.options.length === 0)
      .filter((q) => selectedAnswers[q.id]);

    const shortAnswerPayload = shortAnswerQuestions.map((q) => ({
      id: q.id,
      question: q.content,
      answer: selectedAnswers[q.id],
    }));

    try {
      let aiResults: Record<string, { score: number; feedback: string }> = {};

      if (shortAnswerPayload.length > 0) {
        const res = await fetch('/api/grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questions: shortAnswerPayload }),
        });

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data = await res.json();
        aiResults = data.results || {};
      }

      for (const question of questions) {
        const correctAnswer = question.options.find((opt) => opt.isCorrect);
        if (correctAnswer) {
          if (selectedAnswers[question.id] === correctAnswers[question.id]) {
            calculatedScore++;
          }
        } else {
          const aiEvaluation = aiResults[question.id] || {
            score: 0,
            feedback: 'No AI response',
          };
          updatedEvaluations[question.id] = aiEvaluation;
          if (aiEvaluation.score >= 0.7) {
            calculatedScore++;
          }
        }
      }
    } catch (error) {
      console.error('Error grading short answers:', error);
      toast.error('Error grading short answers. Try again later.');
    }

    setAiEvaluations((prev) => ({ ...prev, ...updatedEvaluations }));
    setScore(calculatedScore);
    setLoading(false);
    setQuizSubmitted(true);
  };

  const handleRetakeQuiz = () => {
    setQuizStarted(false);
    setQuizSubmitted(false);
    setCurrentQuestionIndex(0);
    setTimeRemaining(TOTAL_TIME);
    setSelectedAnswers({});
    setScore(0);
    setAiEvaluations({});
  };

  return (
    <div
      className="mx-auto flex max-w-[50rem] select-none flex-col items-center rounded-3xl border bg-white p-6 shadow-md"
      dir={language === 'Arabic' ? 'rtl' : 'ltr'}
    >
      {!quizStarted ? (
        <>
          {/* Header */}
          <h1 className="text-center text-3xl font-bold">{quizTitle}</h1>

          {/* Description */}
          <p className="mt-4 text-center text-lg text-gray-600">
            Get ready to test your knowledge! This quiz consists of{' '}
            <span className="font-semibold text-purple-600">
              {questions.length} questions
            </span>
            , and you have{' '}
            <span className="font-semibold text-red-600">
              {Math.floor(TOTAL_TIME / 60)} minutes
            </span>{' '}
            to complete it.
          </p>

          {/* Quiz Info */}
          <div className="flex-between mt-6 w-full text-lg font-medium sm:px-6">
            <p className="text-gray-700">📜 {questions.length} Questions</p>
            <p className="text-gray-700">
              ⏳ {Math.floor(TOTAL_TIME / 60)} min
            </p>
          </div>

          {/* Start Button */}
          <Button onClick={() => setQuizStarted(true)} className="mt-8 w-full">
            Start Quiz 🚀
          </Button>
        </>
      ) : (
        <>
          {/* Header */}
          <div className="flex-between mb-4 w-full">
            <h1 className="text-2xl font-bold">{quizTitle}</h1>
            <div className="text-sm font-medium text-red-600">
              {`Time Left: ${Math.floor(timeRemaining / 60)}:${(
                '0' +
                (timeRemaining % 60)
              ).slice(-2)}`}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6 h-2 w-full rounded-full bg-gray-300">
            <div
              className="h-2 rounded-full bg-purple-600 duration-500 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {quizSubmitted ? (
            <div className="w-full text-center">
              {/* Quiz Submitted Header */}
              <h2 className="text-2xl font-semibold text-purple-700">
                Quiz Completed! 🎉
              </h2>

              {/* Score Display */}
              <div className="mt-4 flex flex-col items-center">
                <p className="text-lg font-medium">Your Score</p>
                <div
                  className={`mt-2 flex size-24 items-center justify-center rounded-full text-xl font-bold ${
                    score / questions.length >= 0.7
                      ? 'bg-green-200 text-green-700'
                      : 'bg-red-200 text-red-700'
                  }`}
                >
                  {score} / {questions.length}
                </div>
                <p
                  className={`mt-2 text-lg font-medium ${
                    score / questions.length >= 0.7
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {score / questions.length >= 0.7
                    ? '🎉 Great job! You passed!'
                    : '😔 Try again for a better score!'}
                </p>
              </div>

              {/* Answer Review Section */}
              <div className="mt-6 w-full">
                <h3 className="text-xl font-semibold text-gray-700">
                  Review Your Answers
                </h3>
                <div className="mt-4 space-y-4">
                  {questions.map((q, idx) => {
                    const isMultipleChoice = q.options.length > 0;
                    const isCorrect =
                      selectedAnswers[q.id] === correctAnswers[q.id];
                    // Guard against undefined aiEvaluations entry.
                    const isAiCorrect = aiEvaluations[q.id]
                      ? aiEvaluations[q.id].score >= 0.7
                      : false;
                    return (
                      <div
                        key={idx}
                        className={`rounded-lg border p-4 ${getReviewClass(q)}`}
                      >
                        <p className="font-medium text-gray-800">{`Q${idx + 1}: ${q.content}`}</p>
                        {isMultipleChoice ? (
                          <>
                            <p className="mt-1 text-sm text-gray-600">
                              <span className="font-semibold text-green-600">
                                ✅ Correct:
                              </span>{' '}
                              {
                                q.options.find(
                                  (opt) => opt.id === correctAnswers[q.id]
                                )?.content
                              }
                            </p>
                            <p
                              className={`mt-1 text-sm font-semibold ${
                                isCorrect ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {isCorrect
                                ? '✔ Your answer is correct'
                                : `❌ Your Answer: ${
                                    q.options.find(
                                      (opt) => opt.id === selectedAnswers[q.id]
                                    )?.content || 'No Answer'
                                  }`}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="mt-1 text-sm text-gray-600">
                              <span
                                className={`font-semibold ${
                                  isAiCorrect
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                              >
                                📝 Your Answer:
                              </span>{' '}
                              {selectedAnswers[q.id] || 'No Answer'}
                            </p>
                            {aiEvaluations[q.id] && (
                              <p
                                className={`mt-1 text-sm font-semibold ${
                                  isAiCorrect
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                              >
                                AI Grading: Score {aiEvaluations[q.id].score} –{' '}
                                {aiEvaluations[q.id].feedback}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Retake Quiz Button */}
              <Button onClick={handleRetakeQuiz} className="mt-6 w-full">
                🔁 Retake Quiz
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 w-full">
                {/* Question Display */}
                <h2 className="text-xl font-semibold">
                  {`Question ${currentQuestionIndex + 1}: ${currentQuestion.content}`}
                </h2>

                {/* Options */}
                {currentQuestion.type !== 'SHORT_ANSWER' ? (
                  <div className="mt-4 space-y-4">
                    {currentQuestion.options.map((option, index) => (
                      <Button
                        key={index}
                        variant={
                          selectedAnswers[currentQuestion.id] === option.id
                            ? 'default'
                            : 'outline'
                        }
                        className="flex size-full justify-start whitespace-normal text-left"
                        disabled={loading}
                        onClick={() =>
                          !loading &&
                          handleOptionSelect(currentQuestion.id, option.id)
                        }
                      >
                        {option.content}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4">
                    <Textarea
                      value={selectedAnswers[currentQuestion.id] || ''}
                      rows={5}
                      disabled={loading}
                      onChange={(e) =>
                        !loading &&
                        setSelectedAnswers((prev) => ({
                          ...prev,
                          [currentQuestion.id]: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex w-full justify-between">
                <Button
                  type="button"
                  disabled={loading || currentQuestionIndex === 0} // Disable on loading
                  onClick={() =>
                    !loading && setCurrentQuestionIndex((prev) => prev - 1)
                  }
                  aria-label="Go to previous question"
                >
                  Previous
                </Button>

                {currentQuestionIndex + 1 === questions.length ? (
                  <Button
                    onClick={() => {
                      const unansweredQuestions = questions.some(
                        (q) => !selectedAnswers[q.id]
                      );

                      if (unansweredQuestions) {
                        Swal.fire({
                          title: 'Unanswered Questions!',
                          text: 'You have unanswered questions. Are you sure you want to submit?',
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#9333ea',
                          cancelButtonColor: '#dc2626',
                          confirmButtonText: 'Yes, submit anyway',
                        }).then((result) => {
                          if (result.isConfirmed) {
                            handleSubmit();
                          }
                        });
                      } else {
                        Swal.fire({
                          title: 'Are you sure?',
                          text: 'Do you want to submit your answers?',
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#9333ea',
                          cancelButtonColor: '#dc2626',
                          confirmButtonText: 'Yes, submit!',
                        }).then((result) => {
                          if (result.isConfirmed) {
                            handleSubmit();
                          }
                        });
                      }
                    }}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-600/90"
                    aria-label="Submit your answers"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin text-white" />
                        Submitting...
                      </div>
                    ) : (
                      'Submit'
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      !loading && setCurrentQuestionIndex((prev) => prev + 1)
                    }
                    aria-label="Go to next question"
                  >
                    Next
                  </Button>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default QuizInterface;
