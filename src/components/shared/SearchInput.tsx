'use client';

import { formUrlQueryMulti, removeKeysFromQuery } from '@/lib/utils';
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
        const newUrl = formUrlQueryMulti({
          params: searchParams.toString(),
          queries: [
            { key: 'q', value: search },
            { key: 'page', value: null },
          ],
        });

        router.push(newUrl, { scroll: false });
      } else {
        const newUrl = removeKeysFromQuery({
          params: searchParams.toString(),
          keysToRemove: ['q'],
        });

        router.push(newUrl, { scroll: false });
      }
    }, 500);
    return () => clearTimeout(delayDebounceFunction);
  }, [search, router, searchParams, query]);
  return (
    <div
      className={`flex-center ${classes} rounded-lg bg-gray-100 px-2 max-md:w-full`}
    >
      <Search />
      <Input
        placeholder={placeholder}
        className="no-focus select-none bg-gray-100"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;
