import EditQuestionForm from '@/components/forms/EditQuestionForm';
import {
  getAllCategories,
  getCategoryNameById,
  getQuestionById,
} from '@/lib/actions/question.actions';
import { ParamsProps } from '@/types';

const EditQuestion = async ({ params }: ParamsProps) => {
  const { id } = params;

  const categories = await getAllCategories();
  const question = await getQuestionById({
    id,
  });
  const categoryName = await getCategoryNameById({
    categoryId: question?.categoryId as string,
  });

  return (
    <EditQuestionForm
      categories={categories ?? []}
      initialData={question!}
      categoryName={categoryName!}
    />
  );
};

export default EditQuestion;
