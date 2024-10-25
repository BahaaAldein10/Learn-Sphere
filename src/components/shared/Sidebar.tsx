'use client';

import { StudentSidebarLinks, TeacherSidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();

  const currentRoutes = pathname.includes('/teacher');
  const routes = currentRoutes ? TeacherSidebarLinks : StudentSidebarLinks;

  return (
    <div
      className={`flex h-full flex-col overflow-y-auto border-r bg-white text-purple-900 shadow-sm`}
    >
      <div className="p-6 pb-4">
        <Link href="/">
          <div className="flex items-center gap-2">
            <GraduationCap size={40} />
            <h6 className="select-none text-xl font-semibold">LearnSphere</h6>
          </div>
        </Link>
      </div>

      <div className="flex w-full flex-col">
        {routes.map(({ label, route, Icon }) => {
          const active = pathname === route;

          return (
            <Link
              key={label}
              href={route}
              className={cn(
                'flex items-center select-none text-slate-500 text-sm pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20',
                active &&
                  'text-purple-900 bg-purple-200/20 hover:bg-purple-200/20 hover:text-purple-900'
              )}
            >
              <div className="flex items-center gap-2 py-4">
                <Icon
                  size={22}
                  className={cn('text-slate-500', active && 'text-purple-900')}
                />
                <p className={cn(active && 'text-purple-900 font-semibold')}>
                  {label}
                </p>
              </div>

              <div
                className={cn(
                  'ml-auto opacity-0 border-2',
                  active &&
                    'border-purple-900 bg-purple-200/20 h-full transition-all opacity-100'
                )}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
