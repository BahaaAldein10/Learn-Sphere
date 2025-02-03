import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import React from 'react';

const ConfirmModal = ({
  children,
  onDelete,
  type,
  onOpenChange,
  isOpen,
}: {
  children?: React.ReactNode;
  onDelete: () => void;
  type: string;
  onOpenChange?: (open: boolean) => void;
  isOpen?: boolean;
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      {/* Only show the trigger if children are provided */}
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this {type}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange?.(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onDelete();
              onOpenChange?.(false);
            }}
            className="bg-red-600 hover:bg-red-600/90"
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmModal;
