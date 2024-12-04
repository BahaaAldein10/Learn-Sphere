'use client';

import { QuizOption, QuizQuestion } from '@prisma/client';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';

const QuizInterface = ({
  quizTitle,
  questions,
}: {
  quizTitle: string;
  questions: (QuizQuestion & { options: QuizOption[] })[];
}) => {
  // States to handle quiz
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [timeRemaining, setTimeRemaining] = useState(questions.length * 60); // 60 seconds per question
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const toastShownRef = useRef(false); // Track toast display

  // Load the quiz state from localStorage if available
  useEffect(() => {
    const savedState = localStorage.getItem('quizState');
    if (savedState) {
      const state = JSON.parse(savedState);
      setQuizStarted(state.quizStarted);
      setCurrentQuestionIndex(state.currentQuestionIndex);
      setSelectedAnswers(state.selectedAnswers);
      setTimeRemaining(state.timeRemaining);
      setQuizSubmitted(state.quizSubmitted);
      setScore(state.score);
    }
  }, []);

  // Save the quiz state to localStorage
  useEffect(() => {
    if (quizStarted && !quizSubmitted) {
      const state = {
        quizStarted,
        currentQuestionIndex,
        selectedAnswers,
        timeRemaining,
        quizSubmitted,
        score,
      };
      localStorage.setItem('quizState', JSON.stringify(state));
    }
  }, [
    quizStarted,
    currentQuestionIndex,
    selectedAnswers,
    timeRemaining,
    quizSubmitted,
    score,
  ]);

  // Timer effect for the countdown
  useEffect(() => {
    let timer: number | undefined;
    if (quizStarted && timeRemaining > 0 && !quizSubmitted) {
      timer = window.setInterval(() => {
        setTimeRemaining((prev) => Math.max(prev - 1, 0)); // Countdown timer
      }, 1000);
    }
    if (timeRemaining <= 0) {
      setTimeout(() => handleSubmit(), 2000); // Delay submission by 2 seconds
    }
    return () => clearInterval(timer); // Cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizStarted, timeRemaining, quizSubmitted]);

  // Start quiz
  const startQuiz = () => setQuizStarted(true);

  // Handle option select
  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  // Handle moving to the next question
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Handle moving to the previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Handle quiz submission
  const handleSubmit = () => {
    let calculatedScore = 0;

    // Calculate the score based on selected answers
    questions.forEach((question) => {
      const correctOption = question.options.find(
        (option) => option.isCorrect
      )?.id;

      if (selectedAnswers[question.id] === correctOption) {
        calculatedScore += 1;
      }
    });

    setScore(calculatedScore);
    setQuizSubmitted(true);
    setTimeRemaining(0);

    // Clear only quiz-related state from local storage
    localStorage.removeItem('quizState');

    // Display toast only if not already shown
    if (!toastShownRef.current) {
      toast.success('Quiz submitted successfully!');
      toastShownRef.current = true; // Prevent subsequent calls
    }
  };

  // Handle quiz retake
  const handleRetakeQuiz = () => {
    localStorage.removeItem('quizState');
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeRemaining(questions.length * 60);
    setQuizSubmitted(false);
    setScore(0);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage =
    ((currentQuestionIndex + 1) / questions.length) * 100;

  // If the quiz is not started yet, show start screen
  if (!quizStarted) {
    return (
      <div className="m-auto max-w-3xl rounded-lg border bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">{quizTitle}</h1>
        <p className="mt-4 text-lg text-gray-600">
          Welcome to the quiz! You&apos;ll have {timeRemaining / 60} minutes to
          complete it. Press the button below to start.
        </p>
        <Button onClick={startQuiz} className="mt-6">
          Start Quiz
        </Button>
      </div>
    );
  }

  // If the quiz is submitted, show the results
  if (quizSubmitted) {
    return (
      <div className="m-auto max-w-3xl rounded-lg border bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">{quizTitle}</h1>
        <div className="mt-4 text-lg text-gray-600">
          <h2 className="text-xl font-semibold">Quiz Submitted!</h2>
          <p>
            Your score: {score} out of {questions.length}
          </p>
          <p
            className={`${
              score / questions.length >= 0.7
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {score / questions.length >= 0.7
              ? 'Congratulations! You passed the quiz.'
              : 'Better luck next time!'}
          </p>
          <Button onClick={handleRetakeQuiz} className="mt-4 select-none">
            Retake Quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="m-auto max-w-3xl rounded-lg border bg-white p-8 shadow-md">
      {/* Header Section */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{quizTitle}</h1>
        <div className="text-sm font-medium text-red-600">
          {`Time Left: ${Math.floor(timeRemaining / 60)}:${('0' + (timeRemaining % 60)).slice(-2)}`}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 h-2 w-full rounded-full bg-gray-300">
        <div
          className="h-2 rounded-full bg-purple-600"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Question Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700">
          {`Question ${currentQuestionIndex + 1}: ${currentQuestion.content}`}
        </h2>
      </div>

      {/* Options Section */}
      <div className="space-y-4">
        {currentQuestion.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
            className={`w-full rounded-lg border px-4 py-3 text-left ${
              selectedAnswers[currentQuestion.id] === option.id
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            {option.content}
          </button>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="mt-6 flex select-none justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 || quizSubmitted}
        >
          Previous
        </Button>
        {currentQuestionIndex < questions.length - 1 ? (
          <Button
            onClick={handleNext}
            disabled={quizSubmitted || !selectedAnswers[currentQuestion.id]}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-600/90"
            disabled={quizSubmitted || !selectedAnswers[currentQuestion.id]}
          >
            Submit
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizInterface;
