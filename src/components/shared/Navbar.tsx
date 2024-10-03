'use client';

import { UserButton } from '@clerk/nextjs';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { MobileSidebar } from './MobileSidebar';
import SearchInput from './SearchInput';

const Navbar = () => {
  const pathname = usePathname();
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
        <MobileSidebar />

        {pathname === '/courses' ? (
          <SearchInput placeholder="Search for a Course..." />
        ) : (
          <div />
        )}

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
      </div>
    </nav>
  );
};

export default Navbar;
