'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteUser, updateUserRole } from '@/lib/actions/user.actions';
import { Role, User } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Trash } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '../shared/ConfirmModal';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const RoleSelector = ({ user }: { user: User }) => {
  const { clerkId, role } = user;
  const [selectedRole, setSelectedRole] = useState<Role>(role);
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = async (newRole: Role) => {
    setSelectedRole(newRole);
    startTransition(async () => {
      try {
        await updateUserRole({ clerkId, userRole: newRole });
        toast.success('User role updated successfully');
      } catch (error) {
        console.error(error);
        toast.error('Something went wrong');
        setSelectedRole(role); // Revert on failure
      }
    });
  };

  return (
    <Select
      value={selectedRole}
      onValueChange={handleRoleChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-[140px]" aria-label="Select User Role">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ADMIN">Admin</SelectItem>
        <SelectItem value="TEACHER">Teacher</SelectItem>
        <SelectItem value="STUDENT">Student</SelectItem>
      </SelectContent>
    </Select>
  );
};

const DeleteUser = ({ user }: { user: User }) => {
  const { clerkId } = user;
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        await deleteUser(clerkId);
        toast.success('User deleted successfully');
        router.refresh();
      } catch (error) {
        console.log(error);
        toast.error('Something went wrong');
      } finally {
        setIsOpen(false);
        setDropdownOpen(false);
      }
    });
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild disabled={isPending}>
          <Button variant="ghost" className="h-4 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Ensure that clicking doesn't interfere with the modal */}
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={(e) => {
              e.stopPropagation(); // Prevent unwanted dropdown closure
              setIsOpen(true);
            }}
          >
            <Trash className="mr-2 size-4 text-red-600" />
            <span className="text-red-600">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Move ConfirmModal outside DropdownMenu */}
      <ConfirmModal
        onDelete={handleDelete}
        type="user"
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setDropdownOpen(false);
        }}
        isOpen={isOpen}
      />
    </>
  );
};

export const ColumnUsers: ColumnDef<User>[] = [
  {
    accessorKey: 'picture',
    header: 'Picture',
    cell: ({ row }) => {
      const { picture, username } = row.original;
      return (
        <Image
          src={picture || '/assets/user.png'}
          alt={`${username}'s profile picture`}
          width={32}
          height={32}
          className="rounded-full"
        />
      );
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Email <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Username <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'clerkId',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Clerk ID <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => <RoleSelector user={row.original} />,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DeleteUser user={row.original} />,
  },
];
