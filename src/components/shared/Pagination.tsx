'use client';

import { formUrlQuery } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
}

const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
}: PaginationProps) => {
  const [maxVisiblePages, setMaxVisiblePages] = useState(5);
  const searchParams = useSearchParams();
  const router = useRouter();

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    const updateVisiblePages = () => {
      if (window.innerWidth < 640) {
        setMaxVisiblePages(3);
      } else {
        setMaxVisiblePages(5);
      }
    };

    updateVisiblePages();

    window.addEventListener('resize', updateVisiblePages);

    return () => window.removeEventListener('resize', updateVisiblePages);
  }, []);

  const handlePrevious = () => {
    if (currentPage > 1) {
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'page',
        value: (currentPage - 1).toString(),
      });

      router.push(newUrl);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'page',
        value: (currentPage + 1).toString(),
      });

      router.push(newUrl);
    }
  };

  // Calculate the range of visible page numbers
  const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // Adjust the start page if you're near the end
  const adjustedStartPage = Math.max(1, endPage - maxVisiblePages + 1);

  return (
    <div className="flex-center">
      <Button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`mr-2 select-none ${
          currentPage === 1
            ? 'bg-gray-300 text-gray-500'
            : 'bg-purple-600 text-white hover:bg-purple-700'
        }`}
      >
        Previous
      </Button>

      {/* Show "First" button on larger screens only */}
      {adjustedStartPage > 1 && (
        <Button
          onClick={() =>
            router.push(
              formUrlQuery({
                params: searchParams.toString(),
                key: 'page',
                value: '1',
              })
            )
          }
          className="mx-1 hidden select-none bg-gray-200 text-gray-800 hover:bg-gray-300 sm:block"
        >
          First
        </Button>
      )}

      {/* Page Numbers */}
      {Array.from({ length: endPage - adjustedStartPage + 1 }, (_, index) => {
        const pageNumber = adjustedStartPage + index;

        return (
          <Button
            key={pageNumber}
            onClick={() =>
              router.push(
                formUrlQuery({
                  params: searchParams.toString(),
                  key: 'page',
                  value: pageNumber.toString(),
                })
              )
            }
            className={`mx-1 select-none ${
              currentPage === pageNumber
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {pageNumber}
          </Button>
        );
      })}

      {/* Show "Last" button on larger screens only */}
      {endPage < totalPages && (
        <Button
          onClick={() =>
            router.push(
              formUrlQuery({
                params: searchParams.toString(),
                key: 'page',
                value: totalPages.toString(),
              })
            )
          }
          className="mx-1 hidden select-none bg-gray-200 text-gray-800 hover:bg-gray-300 sm:block"
        >
          Last
        </Button>
      )}

      <Button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`ml-2 select-none ${
          currentPage === totalPages
            ? 'bg-gray-300 text-gray-500'
            : 'bg-purple-600 text-white hover:bg-purple-700'
        }`}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
