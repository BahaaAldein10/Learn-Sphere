import { Editor } from '@tiptap/react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
} from 'lucide-react';
import { Toggle } from '../ui/toggle';

export default function MenuBar({
  editor,
  language,
}: {
  editor: Editor | null;
  language: string;
}) {
  if (!editor) {
    return null;
  }

  const isArabic = language === 'Arabic';

  const Options = [
    {
      icon: <Heading1 className="size-5" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      preesed: editor.isActive('heading', { level: 1 }),
    },
    {
      icon: <Heading2 className="size-5" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      preesed: editor.isActive('heading', { level: 2 }),
    },
    {
      icon: <Heading3 className="size-5" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      preesed: editor.isActive('heading', { level: 3 }),
    },
    {
      icon: <Bold className="size-5" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      preesed: editor.isActive('bold'),
    },
    {
      icon: <Italic className="size-5" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      preesed: editor.isActive('italic'),
    },
    {
      icon: <Strikethrough className="size-5" />,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      preesed: editor.isActive('strike'),
    },
    {
      icon: isArabic ? (
        <AlignRight className="size-5" />
      ) : (
        <AlignLeft className="size-5" />
      ),
      onClick: () =>
        editor
          .chain()
          .focus()
          .setTextAlign(isArabic ? 'right' : 'left')
          .run(),
      preesed: editor.isActive({ textAlign: isArabic ? 'right' : 'left' }),
    },
    {
      icon: <AlignCenter className="size-5" />,
      onClick: () => editor.chain().focus().setTextAlign('center').run(),
      preesed: editor.isActive({ textAlign: 'center' }),
    },
    {
      icon: isArabic ? (
        <AlignLeft className="size-5" />
      ) : (
        <AlignRight className="size-5" />
      ),
      onClick: () =>
        editor
          .chain()
          .focus()
          .setTextAlign(isArabic ? 'left' : 'right')
          .run(),
      preesed: editor.isActive({ textAlign: isArabic ? 'left' : 'right' }),
    },
    {
      icon: <List className="size-5" />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      preesed: editor.isActive('bulletList'),
    },
    {
      icon: <ListOrdered className="size-5" />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      preesed: editor.isActive('orderedList'),
    },
  ];

  return (
    <div
      className="z-50 mb-1 flex flex-wrap items-center gap-2 rounded-md border bg-white p-2"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {Options.map((option, index) => (
        <Toggle
          key={index}
          pressed={option.preesed}
          onPressedChange={option.onClick}
        >
          {option.icon}
        </Toggle>
      ))}
    </div>
  );
}
