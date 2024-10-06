import AskQuestionForm from '@/components/forms/AskQuestion';
import { getAllCategories } from '@/lib/actions/question.actions';

const AskQuestion = async () => {
  const categories = await getAllCategories();

  return <AskQuestionForm categories={categories ?? []} />;
};

export default AskQuestion;
