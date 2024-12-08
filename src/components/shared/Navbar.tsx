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

  const isInCourseOrQuizPage =
    pathname.includes('/courses') &&
    (pathname.includes('/chapters') || pathname.includes('/quiz'));
  const teacherMode = pathname.includes('/teacher') || isInCourseOrQuizPage;
  const isNotRootPath = pathname !== '/';

  return (
    <nav
      className={`flex size-full items-center ${isNotRootPath && !isInCourseOrQuizPage && 'border-b shadow-sm'} bg-white p-4 text-gray-900`}
    >
      <div className="flex-between w-full gap-2">
        {!isInCourseOrQuizPage && <MobileSidebar />}

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
          <div className="flex-center gap-2">
            {isInCourseOrQuizPage && (
              <Link href="/courses">
                <Button
                  variant="ghost"
                  className="flex-center gap-2 text-base font-semibold"
                >
                  <LogOut />
                  Exit
                </Button>
              </Link>
            )}

            <UserButton />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
