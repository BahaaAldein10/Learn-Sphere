'use client';

import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

interface EditorProps {
  onChange: (value: string) => void;
  value: string;
}

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const Editor = ({ onChange, value }: EditorProps) => {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      className="h-[7.5rem] bg-white"
    />
  );
};

export default Editor;
