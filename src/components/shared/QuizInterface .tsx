'use client';

import { getLocalizedText } from '@/lib/localization';
import { QuizOption, QuizQuestion } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import RichTextEditor from '../RichTextEditor/RichTextEditor';
import { Button } from '../ui/button';

interface QuizInterfaceProps {
  quizTitle: string;
  questions: (QuizQuestion & { options: QuizOption[] })[];
  language: string;
  time: number;
}

const QuizInterface = ({
  quizTitle,
  questions,
  language,
  time: timeInMinutes,
}: QuizInterfaceProps) => {
  const localizedText = getLocalizedText(language);
  const titleFontClass = language === 'Arabic' ? 'font-semibold' : 'font-bold';
  const arabicFontClass = language === 'Arabic' ? 'font-semibold' : '';
  const TOTAL_TIME = timeInMinutes * 60;

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

  const correctAnswers = Object.fromEntries(
    questions.map((q) => [
      q.id,
      q.options.find((opt) => opt.isCorrect)?.id ?? '',
    ])
  );

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
      setTimeout(() => toast(localizedText.timeUpText), 0);
      setTimeout(handleSubmit, 2000);
    }

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizStarted, timeRemaining, quizSubmitted, localizedText.timeUpText]);

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
          body: JSON.stringify({ questions: shortAnswerPayload, language }),
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
            feedback: localizedText.noAiResponseText,
          };
          updatedEvaluations[question.id] = aiEvaluation;
          if (aiEvaluation.score >= 0.7) {
            calculatedScore++;
          }
        }
      }
    } catch (error) {
      console.error('Error grading short answers:', error);
      toast.error(localizedText.shortAnswerErrorText);
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
          <h1 className={`text-center text-3xl ${titleFontClass}`}>
            {quizTitle}
          </h1>

          {/* Description */}
          <p className="mt-4 text-center text-lg text-gray-600">
            {localizedText.getReadyText} {localizedText.quizConsistsOfText}{' '}
            <span className="font-semibold text-purple-600">
              {questions.length} {localizedText.questionsText}
            </span>
            , {localizedText.andYouHaveText}{' '}
            <span className="font-semibold text-red-600">
              {Math.floor(TOTAL_TIME / 60)} {localizedText.minutesText}
            </span>{' '}
            {localizedText.completeText}.
          </p>

          {/* Quiz Info */}
          <div className="flex-between mt-6 w-full text-lg font-medium sm:px-6">
            <p className="text-gray-700">
              📜 {questions.length} {localizedText.questionsLabel}
            </p>
            <p className="text-gray-700">
              ⏳ {Math.floor(TOTAL_TIME / 60)} {localizedText.minLabel}
            </p>
          </div>

          {/* Start Button */}
          <Button onClick={() => setQuizStarted(true)} className="mt-8 w-full">
            {localizedText.startQuizText}
          </Button>
        </>
      ) : (
        <>
          {/* Header */}
          <div className="flex-between mb-4 w-full">
            <h1 className={`text-2xl ${titleFontClass}`}>{quizTitle}</h1>
            <div className="text-sm font-medium text-red-600">
              {`${localizedText.timeLeftText} ${Math.floor(timeRemaining / 60)}:${('0' + (timeRemaining % 60)).slice(-2)}`}
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
                {localizedText.quizCompletedText}
              </h2>

              {/* Score Display */}
              <div className="mt-4 flex flex-col items-center">
                <p className="text-lg font-medium">
                  {localizedText.yourScoreText}
                </p>
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
                    ? localizedText.greatJobText
                    : localizedText.tryAgainText}
                </p>
              </div>

              {/* Answer Review Section */}
              <div className="mt-6 w-full">
                <h3 className="text-xl font-semibold text-gray-700">
                  {localizedText.reviewAnswersText}
                </h3>
                <div className="mt-4 space-y-4">
                  {questions.map((q, idx) => {
                    const isMultipleChoice = q.options.length > 0;
                    const isCorrect =
                      selectedAnswers[q.id] === correctAnswers[q.id];
                    const isAiCorrect = aiEvaluations[q.id]
                      ? aiEvaluations[q.id].score >= 0.7
                      : false;
                    return (
                      <div
                        key={idx}
                        className={`rounded-lg border p-4 ${getReviewClass(q)}`}
                      >
                        <p className="font-medium text-gray-800">
                          {`${localizedText.questionLabel} ${idx + 1}: ${q.content}`}
                        </p>
                        {isMultipleChoice ? (
                          <>
                            <p className="mt-1 text-sm text-gray-600">
                              <span className="font-semibold text-green-600">
                                {localizedText.correctText}
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
                                ? localizedText.yourAnswerCorrectText
                                : `${localizedText.yourAnswerIncorrectText} ${
                                    q.options.find(
                                      (opt) => opt.id === selectedAnswers[q.id]
                                    )?.content || localizedText.noAnswerText
                                  }`}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="mt-1 text-sm text-gray-600">
                              <span
                                className={`font-semibold ${isAiCorrect ? 'text-green-600' : 'text-red-600'}`}
                              >
                                {localizedText.yourAnswerText}
                              </span>{' '}
                              {selectedAnswers[q.id] ||
                                localizedText.noAnswerText}
                            </p>
                            {aiEvaluations[q.id] && (
                              <p
                                className={`mt-1 text-sm font-semibold ${
                                  isAiCorrect
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {localizedText.aiGradingText}{' '}
                                {aiEvaluations[q.id].score} –{' '}
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
                {localizedText.retakeQuizText}
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 w-full">
                {/* Question Display */}
                <h2 className="text-xl font-semibold">
                  {`${localizedText.questionText} ${currentQuestionIndex + 1}: ${currentQuestion.content}`}
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
                        className={`${arabicFontClass} flex size-full justify-start whitespace-normal text-left`}
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
                    <RichTextEditor
                      content={selectedAnswers[currentQuestion.id] || ''}
                      language={language}
                      disabled={loading}
                      onChange={(value) =>
                        !loading &&
                        setSelectedAnswers((prev) => ({
                          ...prev,
                          [currentQuestion.id]: value,
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
                  disabled={loading || currentQuestionIndex === 0}
                  onClick={() =>
                    !loading && setCurrentQuestionIndex((prev) => prev - 1)
                  }
                  aria-label="Go to previous question"
                >
                  {localizedText.previousText}
                </Button>

                {currentQuestionIndex + 1 === questions.length ? (
                  <Button
                    onClick={() => {
                      const unansweredQuestions = questions.some(
                        (q) => !selectedAnswers[q.id]
                      );
                      if (unansweredQuestions) {
                        Swal.fire({
                          title: localizedText.unansweredQuestionsTitle,
                          text: localizedText.unansweredQuestionsText,
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#9333ea',
                          cancelButtonColor: '#dc2626',
                          confirmButtonText: localizedText.submitAnywayText,
                        }).then((result) => {
                          if (result.isConfirmed) {
                            handleSubmit();
                          }
                        });
                      } else {
                        Swal.fire({
                          title: localizedText.areYouSureTitle,
                          text: localizedText.areYouSureText,
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#9333ea',
                          cancelButtonColor: '#dc2626',
                          confirmButtonText: localizedText.yesSubmitText,
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
                        {localizedText.submittingText}
                      </div>
                    ) : (
                      localizedText.submitText
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
                    {localizedText.nextText}
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
