export interface LocalizedText {
  getReadyText: string;
  quizConsistsOfText: string;
  andYouHaveText: string;
  questionsText: string;
  minutesText: string;
  completeText: string;
  questionsLabel: string;
  minLabel: string;
  startQuizText: string;
  timeLeftText: string;
  previousText: string;
  nextText: string;
  submitText: string;
  submittingText: string;
  timeUpText: string;
  quizCompletedText: string;
  yourScoreText: string;
  greatJobText: string;
  tryAgainText: string;
  reviewAnswersText: string;
  correctText: string;
  yourAnswerCorrectText: string;
  yourAnswerIncorrectText: string;
  yourAnswerText: string;
  noAnswerText: string;
  aiGradingText: string;
  retakeQuizText: string;
  questionText: string;
  unansweredQuestionsTitle: string;
  unansweredQuestionsText: string;
  submitAnywayText: string;
  areYouSureTitle: string;
  areYouSureText: string;
  yesSubmitText: string;
  noAiResponseText: string;
  shortAnswerErrorText: string;
  questionLabel: string;
}

export const getLocalizedText = (language: string): LocalizedText => {
  return {
    getReadyText:
      language === 'Arabic'
        ? 'استعد لاختبار معرفتك!'
        : 'Get ready to test your knowledge!',
    quizConsistsOfText:
      language === 'Arabic' ? 'يتألف الاختبار من' : 'This quiz consists of',
    andYouHaveText: language === 'Arabic' ? 'ولديك' : 'and you have',
    questionsText: language === 'Arabic' ? 'أسئلة' : 'questions',
    minutesText: language === 'Arabic' ? 'دقيقة' : 'minutes',
    completeText: language === 'Arabic' ? 'لإكمالها' : 'to complete it',
    questionsLabel: language === 'Arabic' ? 'أسئلة' : 'Questions',
    minLabel: language === 'Arabic' ? 'دقيقة' : 'min',
    startQuizText: language === 'Arabic' ? 'ابدأ الاختبار 🚀' : 'Start Quiz 🚀',
    timeLeftText: language === 'Arabic' ? 'الوقت المتبقي:' : 'Time Left:',
    previousText: language === 'Arabic' ? 'السابق' : 'Previous',
    nextText: language === 'Arabic' ? 'التالي' : 'Next',
    submitText: language === 'Arabic' ? 'إرسال' : 'Submit',
    submittingText: language === 'Arabic' ? 'جارٍ الإرسال...' : 'Submitting...',
    timeUpText:
      language === 'Arabic'
        ? '⏳ انتهى الوقت! جارٍ الإرسال...'
        : '⏳ Time is up! Submitting...',
    quizCompletedText:
      language === 'Arabic' ? 'اكتمل الاختبار! 🎉' : 'Quiz Completed! 🎉',
    yourScoreText: language === 'Arabic' ? 'نتيجتك' : 'Your Score',
    greatJobText:
      language === 'Arabic'
        ? '🎉 عمل رائع! لقد نجحت!'
        : '🎉 Great job! You passed!',
    tryAgainText:
      language === 'Arabic'
        ? '😔 حاول مرة أخرى للحصول على نتيجة أفضل!'
        : '😔 Try again for a better score!',
    reviewAnswersText:
      language === 'Arabic' ? 'مراجعة إجاباتك' : 'Review Your Answers',
    correctText: language === 'Arabic' ? '✅ الصحيح:' : '✅ Correct:',
    yourAnswerCorrectText:
      language === 'Arabic' ? '✔ إجابتك صحيحة' : '✔ Your answer is correct',
    yourAnswerIncorrectText:
      language === 'Arabic' ? '❌ إجابتك:' : '❌ Your Answer:',
    yourAnswerText: language === 'Arabic' ? '📝 إجابتك:' : '📝 Your Answer:',
    noAnswerText: language === 'Arabic' ? 'لا إجابة' : 'No Answer',
    aiGradingText:
      language === 'Arabic'
        ? 'تقييم الذكاء الاصطناعي: الدرجة'
        : 'AI Grading: Score',
    retakeQuizText:
      language === 'Arabic' ? '🔁 إعادة الاختبار' : '🔁 Retake Quiz',
    questionText: language === 'Arabic' ? 'السؤال' : 'Question',
    unansweredQuestionsTitle:
      language === 'Arabic' ? 'أسئلة بدون إجابة!' : 'Unanswered Questions!',
    unansweredQuestionsText:
      language === 'Arabic'
        ? 'لديك أسئلة بدون إجابة. هل أنت متأكد من رغبتك في الإرسال؟'
        : 'You have unanswered questions. Are you sure you want to submit?',
    submitAnywayText:
      language === 'Arabic' ? 'نعم، أرسل على أي حال' : 'Yes, submit anyway',
    areYouSureTitle: language === 'Arabic' ? 'هل أنت متأكد؟' : 'Are you sure?',
    areYouSureText:
      language === 'Arabic'
        ? 'هل تريد إرسال إجاباتك؟'
        : 'Do you want to submit your answers?',
    yesSubmitText: language === 'Arabic' ? 'نعم، أرسل!' : 'Yes, submit!',
    noAiResponseText:
      language === 'Arabic'
        ? 'لا يوجد رد من الذكاء الاصطناعي'
        : 'No AI response',
    shortAnswerErrorText:
      language === 'Arabic'
        ? 'خطأ في تقييم الإجابات القصيرة. حاول مرة أخرى لاحقاً.'
        : 'Error grading short answers. Try again later.',
    questionLabel: language === 'Arabic' ? 'السؤال' : 'Q',
  };
};
