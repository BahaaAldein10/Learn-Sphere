'use client';

import { getLocalizedText } from '@/lib/localization';
import { htmlToPlainText } from '@/lib/utils';
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
  weightMCQ: number;
  weightTF: number;
  weightShort: number;
  criteria: string;
}

type EvalResult = {
  id: string;
  type: string;
  rawScore: number;
  weightedScore: number;
  feedback: string;
};

const QuizInterface = ({
  quizTitle,
  questions,
  language,
  time: timeInMinutes,
  weightMCQ,
  weightTF,
  weightShort,
  criteria,
}: QuizInterfaceProps) => {
  const localizedText = getLocalizedText(language);
  const commonTextClass = 'font-bold';
  const TOTAL_TIME = timeInMinutes * 60;

  const arabicTextClasses =
    language === 'Arabic' ? 'text-base font-arabic font-semibold' : '';

  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [score, setScore] = useState(0);
  const [overallScore, setOverallScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [questionResults, setQuestionResults] = useState<
    Record<string, EvalResult>
  >({});

  const correctAnswers = Object.fromEntries(
    questions.map((q) => [
      q.id,
      q.options.find((opt) => opt.isCorrect)?.id ?? '',
    ])
  );

  const getReviewClass = (q: QuizQuestion & { options: QuizOption[] }) => {
    if (!questionResults[q.id]) {
      return 'border-gray-300 bg-gray-100';
    }

    return questionResults[q.id].rawScore >= 0.7
      ? 'border-green-400 bg-green-100'
      : 'border-red-400 bg-red-100';
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

    try {
      // Prepare all questions for evaluation
      const questionsPayload = questions.map((q) => ({
        id: q.id,
        question: q.content,
        answer: selectedAnswers[q.id] || '',
        type: q.type,
        correctOptionId: q.options.find((o) => o.isCorrect)?.id,
      }));

      // Send all questions to the API
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: questionsPayload,
          language,
          defaultWeightMCQ: weightMCQ,
          defaultWeightTF: weightTF,
          defaultWeightShort: weightShort,
          criteria,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      // Map results to questions
      const resultsMap: Record<string, EvalResult> = {};
      data.results.forEach((result: EvalResult) => {
        resultsMap[result.id] = result;
      });

      // Update state with results
      setQuestionResults(resultsMap);
      setOverallScore(data.overallScore);

      // Calculate raw score for the simple score display (number correct out of total)
      let rawScoreCount = 0;
      Object.values(resultsMap).forEach((result) => {
        if (result.rawScore >= 0.7) {
          rawScoreCount++;
        }
      });

      setScore(rawScoreCount);
    } catch (error) {
      console.error('Error grading answers:', error);
      toast.error(localizedText.shortAnswerErrorText);
    }

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
    setOverallScore(0);
    setQuestionResults({});
  };

  return (
    <div
      className={`mx-auto flex max-w-[50rem] select-none flex-col items-center rounded-3xl border bg-white p-6 shadow-md ${commonTextClass} ${arabicTextClasses}`}
      dir={language === 'Arabic' ? 'rtl' : 'ltr'}
    >
      {!quizStarted ? (
        <>
          {/* Header */}
          <h1
            className={`text-center text-3xl ${commonTextClass} ${arabicTextClasses}`}
          >
            {quizTitle}
          </h1>

          {/* Description */}
          <p
            className={`mt-4 text-center text-lg text-gray-600 ${commonTextClass} ${arabicTextClasses}`}
          >
            {localizedText.getReadyText} {localizedText.quizConsistsOfText}{' '}
            <span className="text-purple-600">
              {questions.length} {localizedText.questionsText}
            </span>
            , {localizedText.andYouHaveText}{' '}
            <span className="text-red-600">
              {Math.floor(TOTAL_TIME / 60)} {localizedText.minutesText}
            </span>{' '}
            {localizedText.completeText}.
          </p>

          {/* Quiz Info */}
          <div
            className={`flex-between mt-6 w-full text-lg sm:px-6 ${commonTextClass} ${arabicTextClasses}`}
          >
            <p className="text-gray-700">
              📜 {questions.length} {localizedText.questionsLabel}
            </p>
            <p className="text-gray-700">
              ⏳ {Math.floor(TOTAL_TIME / 60)} {localizedText.minLabel}
            </p>
          </div>

          {/* Start Button */}
          <Button
            onClick={() => setQuizStarted(true)}
            className={`mt-8 w-full ${arabicTextClasses}`}
          >
            {localizedText.startQuizText}
          </Button>
        </>
      ) : (
        <>
          {/* Header */}
          <div className="flex-between mb-4 w-full">
            <h1 className={`text-2xl ${commonTextClass} ${arabicTextClasses}`}>
              {quizTitle}
            </h1>
            <div
              className={`text-sm font-medium text-red-600 ${arabicTextClasses}`}
            >
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
              <h2
                className={`text-2xl ${commonTextClass} ${arabicTextClasses} text-purple-700`}
              >
                {localizedText.quizCompletedText}
              </h2>

              {/* Score Display */}
              <div
                className={`mt-4 flex flex-col items-center ${commonTextClass} ${arabicTextClasses}`}
              >
                <p className="text-lg">{localizedText.yourScoreText}</p>
                <div
                  className={`mt-2 flex items-center justify-center rounded-full p-3 text-xl ${commonTextClass} ${
                    overallScore >= 0.7
                      ? 'bg-green-200 text-green-700'
                      : 'bg-red-200 text-red-700'
                  }`}
                >
                  {score} / {questions.length} ({Math.round(overallScore * 100)}
                  %)
                </div>
                <p
                  className={`mt-2 text-lg ${commonTextClass} ${
                    overallScore >= 0.7 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {overallScore >= 0.7
                    ? localizedText.greatJobText
                    : localizedText.tryAgainText}
                </p>
              </div>

              {/* Answer Review Section */}
              <div className="mt-6 w-full">
                <h3
                  className={`text-xl ${commonTextClass} ${arabicTextClasses} text-gray-700`}
                >
                  {localizedText.reviewAnswersText}
                </h3>
                <div className="mt-4 space-y-4">
                  {questions.map((q, idx) => {
                    const result = questionResults[q.id];
                    const isMultipleChoice =
                      q.type === 'MCQ' || q.type === 'TRUE_FALSE';

                    return (
                      <div
                        key={idx}
                        className={`rounded-lg border p-4 ${getReviewClass(q)}`}
                      >
                        <p
                          className={`text-gray-800 ${commonTextClass} ${arabicTextClasses}`}
                        >
                          {`${localizedText.questionLabel} ${idx + 1}: ${q.content}`}
                        </p>

                        {isMultipleChoice ? (
                          <>
                            <p className="mt-1 text-sm text-gray-600">
                              <span className="text-green-600">
                                {localizedText.correctText}
                              </span>{' '}
                              {
                                q.options.find(
                                  (opt) => opt.id === correctAnswers[q.id]
                                )?.content
                              }
                            </p>
                            <p
                              className={`mt-1 text-sm ${commonTextClass} ${arabicTextClasses} ${
                                result && result.rawScore > 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {result && result.rawScore > 0
                                ? localizedText.yourAnswerCorrectText
                                : `${localizedText.yourAnswerIncorrectText} ${
                                    q.options.find(
                                      (opt) => opt.id === selectedAnswers[q.id]
                                    )?.content || localizedText.noAnswerText
                                  }`}
                            </p>
                            {result && result.type === 'SHORT_ANSWER' && (
                              <p
                                className={`mt-1 text-sm italic ${result.rawScore > 0 ? 'text-green-600' : 'text-red-600'}`}
                              >
                                {result.feedback}
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="mt-1 text-sm text-gray-600">
                              <span
                                className={`${commonTextClass} ${arabicTextClasses}`}
                              >
                                {localizedText.yourAnswerText}
                              </span>{' '}
                              {htmlToPlainText(selectedAnswers[q.id]) ||
                                localizedText.noAnswerText}
                            </p>
                            {result && (
                              <p
                                className={`mt-1 text-sm ${commonTextClass} ${arabicTextClasses} ${
                                  result.rawScore >= 0.7
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {localizedText.aiGradingText}{' '}
                                {Math.round(result.rawScore * 10) / 10} –{' '}
                                {result.feedback}
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
              <Button
                onClick={handleRetakeQuiz}
                className={`mt-6 w-full ${arabicTextClasses}`}
              >
                {localizedText.retakeQuizText}
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 w-full">
                {/* Question Display */}
                <h2
                  className={`text-xl ${commonTextClass} ${arabicTextClasses}`}
                >
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
                        className={`flex size-full justify-start whitespace-normal text-left ${commonTextClass} ${arabicTextClasses}`}
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
                  className={`${arabicTextClasses} !text-sm`}
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
                    className={`bg-green-600 hover:bg-green-600/90 ${arabicTextClasses} !text-sm`}
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
                    className={`${arabicTextClasses} !text-sm`}
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
