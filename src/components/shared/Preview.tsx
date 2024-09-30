'use client';

import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.bubble.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const Preview = ({ value }: { value: string }) => {
  return <ReactQuill theme="bubble" readOnly value={value} />;
};

export default Preview;
