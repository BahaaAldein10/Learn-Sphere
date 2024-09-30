'use client';

import { cn } from '@/lib/utils';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { Grip, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../ui/badge';

type Chapter = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  position: number;
  isPublished: boolean;
  isFree: boolean;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
};

interface ChaptersListProps {
  items: Chapter[];
  onReorder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
}

const ChaptersList = ({ items, onReorder, onEdit }: ChaptersListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [chapters, setChapters] = useState(items);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setChapters(items);
  }, [items]);

  if (!isMounted) return null;

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedChapters = Array.from(chapters);
    const [movedChapter] = reorderedChapters.splice(result.source.index, 1);
    reorderedChapters.splice(result.destination.index, 0, movedChapter);

    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);

    const updatedChapters = reorderedChapters.slice(startIndex, endIndex + 1);

    setChapters(reorderedChapters);

    onReorder(
      updatedChapters.map((chapter) => ({
        id: chapter.id,
        position:
          reorderedChapters.findIndex((item) => item.id === chapter.id) + 1,
      }))
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="chapters">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {chapters.map((chapter, index) => (
              <Draggable
                key={chapter.id}
                draggableId={chapter.id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={cn(
                      `flex items-center gap-x-2 bg-gray-200 border-gray-200 border text-gray-700 rounded-md mb-4 text-sm
                       ${chapter.isPublished && 'bg-blue-100 border-blue-200 text-blue-700'}`
                    )}
                  >
                    <div
                      {...provided.dragHandleProps}
                      className={cn(`
                        cursor-grab px-2 py-3 border-r border-r-gray-200 hover:bg-gray-300 rounded-l-md transition
                         ${chapter.isPublished && 'border-r-blue-200 hover:bg-blue-200'}`)}
                    >
                      <Grip className="size-5" />
                    </div>

                    {chapter.title}

                    <div className="ml-auto flex items-center gap-x-2 pr-2">
                      {chapter.isFree && <Badge>Free</Badge>}
                      <Badge>
                        {chapter.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      <Pencil
                        onClick={() => onEdit(chapter.id)}
                        className="size-4 cursor-pointer transition hover:opacity-75"
                      />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ChaptersList;
