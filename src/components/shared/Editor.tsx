'use client';

import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

interface EditorProps {
  onChange: (value: string) => void;
  value: string;
  placeholder: string;
  className?: string;
}

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const Editor = ({ onChange, value, placeholder }: EditorProps) => {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="bg-white"
    />
  );
};

export default Editor;
