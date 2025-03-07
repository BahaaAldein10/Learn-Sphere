'use client';

import { QuizOption, QuizQuestion } from '@prisma/client';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';

interface QuizInterfaceProps {
  quizTitle: string;
  questions: (QuizQuestion & { options: QuizOption[] })[];
}

const QuizInterface = ({ quizTitle, questions }: QuizInterfaceProps) => {
  const TOTAL_TIME = questions.length * 60;

  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [score, setScore] = useState(0);
  const toastShownRef = useRef(false);

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
    if (!quizStarted || quizSubmitted || timeRemaining <= 0) return;

    const timer = setInterval(
      () => setTimeRemaining((prev) => Math.max(prev - 1, 0)),
      1000
    );
    if (timeRemaining <= 0) setTimeout(() => handleSubmit(), 2000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizStarted, timeRemaining, quizSubmitted]);

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = () => {
    setQuizSubmitted(true);
    const calculatedScore = questions.reduce(
      (acc, q) =>
        acc + (selectedAnswers[q.id] === correctAnswers[q.id] ? 1 : 0),
      0
    );
    setScore(calculatedScore);
    if (!toastShownRef.current) {
      toast.success('Quiz submitted successfully!');
      toastShownRef.current = true;
    }
  };

  const handleRetakeQuiz = () => {
    setQuizStarted(false);
    setQuizSubmitted(false);
    setCurrentQuestionIndex(0);
    setTimeRemaining(TOTAL_TIME);
    setSelectedAnswers({});
    setScore(0);
  };

  return (
    <div className="mx-auto flex max-w-[50rem] select-none flex-col items-center rounded-3xl border bg-white p-6 shadow-md">
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
          <div className="flex-between mt-6 w-full px-6 text-lg font-medium">
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
              {`Time Left: ${Math.floor(timeRemaining / 60)}:${('0' + (timeRemaining % 60)).slice(-2)}`}
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
                    const isCorrect =
                      selectedAnswers[q.id] === correctAnswers[q.id];
                    return (
                      <div
                        key={idx}
                        className={`rounded-lg border p-4 ${
                          isCorrect
                            ? 'border-green-400 bg-green-100'
                            : 'border-red-400 bg-red-100'
                        }`}
                      >
                        <p className="font-medium text-gray-800">{`Q${idx + 1}: ${q.content}`}</p>
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
                          className={`mt-1 text-sm font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {isCorrect
                            ? '✔ Your answer is correct'
                            : `❌ Your Answer: ${q.options.find((opt) => opt.id === selectedAnswers[q.id])?.content || 'No Answer'}`}
                        </p>
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
                <div className="mt-4 space-y-4">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      variant={
                        selectedAnswers[currentQuestion.id] === option.id
                          ? 'default'
                          : 'outline'
                      }
                      className="w-full justify-start"
                      onClick={() =>
                        handleOptionSelect(currentQuestion.id, option.id)
                      }
                    >
                      {option.content}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex-between w-full">
                <Button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                >
                  Previous
                </Button>

                {currentQuestionIndex + 1 === questions.length ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      Object.keys(selectedAnswers).length < questions.length
                    }
                    className="bg-green-600 hover:bg-green-600/90"
                  >
                    Submit
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
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
