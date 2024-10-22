'use client';

import { formUrlQueryMulti } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface FilterProps {
  filters: {
    name: string;
    value: string;
  }[];
  classes?: string;
}

const Filter = ({ filters, classes }: FilterProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleFilterChange = (value: string) => {
    const newUrl = formUrlQueryMulti({
      params: searchParams.toString(),
      queries: [
        { key: 'filter', value },
        { key: 'page', value: null },
      ],
    });

    router.push(newUrl, { scroll: false });
  };

  return (
    <Select
      onValueChange={handleFilterChange}
      defaultValue={searchParams.get('filter') || undefined}
    >
      <SelectTrigger className={`${classes} rounded-lg`}>
        <div className="line-clamp-1 flex-1 text-left">
          <SelectValue placeholder="Select a Filter" />
        </div>
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          {filters.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default Filter;
