'use client';

import { formUrlQuery, removeKeysFromQuery } from '@/lib/utils';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Input } from '../ui/input';

interface SearchInputProps {
  placeholder: string;
  classes?: string;
}

const SearchInput = ({ placeholder, classes }: SearchInputProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q');
  const [search, setSearch] = useState(query || '');

  useEffect(() => {
    const delayDebounceFunction = setTimeout(() => {
      if (search) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: 'q',
          value: search,
        });

        router.push(newUrl, { scroll: false });
      } else {
        const newUrl = removeKeysFromQuery({
          params: searchParams.toString(),
          keysToRemove: ['q'],
        });

        router.push(newUrl, { scroll: false });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFunction);
  }, [searchParams, router, search]);

  return (
    <div
      className={`flex-center ${classes} w-full rounded-lg bg-gray-100 px-2`}
    >
      <Search />
      <Input
        placeholder={placeholder}
        className="no-focus bg-gray-100"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;
