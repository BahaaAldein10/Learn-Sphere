'use client';

import { COURSE_SORT_OPTIONS } from '@/constants';
import { cn, formUrlQuery } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

const CourseFilters = () => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: 'filter',
      value: selectedFilter,
    });

    router.push(newUrl, { scroll: false });
  }, [router, searchParams, selectedFilter]);

  return (
    <div className="p-6 pb-0">
      <div className="flex flex-wrap items-center gap-4">
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
            <span className='max-[525px]:hidden'>{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CourseFilters;
