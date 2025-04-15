import TextAlign from '@tiptap/extension-text-align';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import MenuBar from './MenuBar';

export interface RichTextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  language?: string;
  disabled?: boolean;
  placeholder?: string;
}

const RichTextEditor = ({
  content = '',
  onChange,
  language = 'English',
  disabled = false,
  placeholder = 'Start typing here...',
}: RichTextEditorProps) => {
  const isArabic = language === 'Arabic';

  const editor = useEditor({
    content,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: `list-disc ${isArabic ? 'mr-3' : 'ml-3'}`,
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: `list-decimal ${isArabic ? 'mr-3' : 'ml-3'}`,
          },
        },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    editorProps: {
      attributes: {
        class:
          'min-h-[156px] border rounded-md bg-white py-2 px-3 focus-visible:ring-primary focus-visible:ring-2 focus:outline-none',
        spellCheck: 'true',
        dir: isArabic ? 'rtl' : 'ltr',
        placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!editor) return null;

  return (
    <div className="space-y-2">
      {!disabled && <MenuBar editor={editor} language={language} />}
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
