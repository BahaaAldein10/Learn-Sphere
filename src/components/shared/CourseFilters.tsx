'use client';

import { COURSE_SORT_OPTIONS } from '@/constants';
import { cn, formUrlQueryMulti } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

const CourseFilters = () => {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(
    filter || null
  );
  const router = useRouter();

  useEffect(() => {
    const newUrl = formUrlQueryMulti({
      params: searchParams.toString(),
      queries: [
        { key: 'filter', value: selectedFilter },
        { key: 'page', value: null },
      ],
    });

    router.push(newUrl, { scroll: false });
  }, [router, searchParams, selectedFilter]);

  return (
    <div className="p-6 pb-0">
      <div className="flex flex-wrap items-center gap-4 max-sm:gap-3">
        {COURSE_SORT_OPTIONS.map(({ value, Icon, label }, index) => (
          <Button
            key={index}
            variant={'outline'}
            onClick={() => {
              if (value === selectedFilter) {
                setSelectedFilter(null);
              } else setSelectedFilter(value);
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm transition-all',
              selectedFilter === value
                ? 'bg-purple-100 text-purple-700 hover:text-purple-700'
                : 'hover:bg-purple-50 hover:text-purple-600'
            )}
          >
            <Icon className="size-4" />
            <span className="max-[525px]:hidden">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CourseFilters;
