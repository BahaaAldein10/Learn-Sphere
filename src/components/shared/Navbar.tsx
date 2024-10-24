'use client';

import { getUser } from '@/lib/actions/user.actions';
import { useAuth, UserButton } from '@clerk/nextjs';
import { Role } from '@prisma/client';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { redirect, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { MobileSidebar } from './MobileSidebar';
import SearchInput from './SearchInput';

const Navbar = () => {
  const pathname = usePathname();
  const { userId } = useAuth();
  const [userRole, setUserRole] = useState<Role>();

  useEffect(() => {
    if (!userId) return redirect('/');

    const fetchUserRole = async () => {
      const user = await getUser({ userId });
      setUserRole(user?.role);
    };

    fetchUserRole();
  }, [userId]);

  const teacherMode =
    pathname.includes('/teacher') ||
    (pathname.includes('/courses') && pathname.includes('/chapters'));
  const isNotRootPath = pathname !== '/';
  const isCourseOrChapter =
    pathname.includes('/courses') &&
    pathname.includes('/chapters') &&
    !pathname.startsWith('/teacher');

  return (
    <nav
      className={`flex size-full items-center ${isNotRootPath && !isCourseOrChapter && 'border-b shadow-sm'} bg-white p-4 text-gray-900`}
    >
      <div className="flex-between w-full">
        {!isCourseOrChapter && <MobileSidebar />}

        {pathname === '/courses' ? (
          <SearchInput placeholder="Search for a Course..." />
        ) : (
          <div />
        )}

        {userRole === 'TEACHER' ? (
          <div className="flex-center gap-2">
            <Link href={teacherMode ? '/courses' : '/teacher/courses/'}>
              <Button
                variant="ghost"
                className="flex gap-2 text-base font-semibold"
              >
                {teacherMode && <LogOut />}
                {teacherMode ? 'Exit' : 'Teacher Mode'}
              </Button>
            </Link>

            <UserButton />
          </div>
        ) : (
          <UserButton />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
