import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserType, UserTypeSelectorParams } from '@/types';

const UserTypeSelector = ({
  userType,
  setUserType,
  onClickHandler,
}: UserTypeSelectorParams) => {
  const accessChangeHandler = (type: UserType) => {
    setUserType(type);
    if (onClickHandler) {
      onClickHandler(type);
    }
  };

  return (
    <Select
      value={userType}
      onValueChange={(type: UserType) => accessChangeHandler(type)}
    >
      <SelectTrigger className="no-focus w-fit bg-gray-100">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className='z-[999]'>
        <SelectItem value="viewer">can view</SelectItem>
        <SelectItem value="editor">can edit</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default UserTypeSelector;
