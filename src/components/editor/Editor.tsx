'use client';

import { UserType } from '@/types';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode } from '@lexical/rich-text';
import {
  FloatingComposer,
  FloatingThreads,
  liveblocksConfig,
  LiveblocksPlugin,
} from '@liveblocks/react-lexical';
import { useThreads } from '@liveblocks/react/suspense';
import FloatingToolbarPlugin from './plugins/FloatingToolbarPlugin';
import Theme from './plugins/Theme';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import Comments from '../shared/Comments';

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

export function Editor({
  // roomId,
  currentUserType,
}: {
  roomId: string;
  currentUserType: UserType;
}) {
  const { threads } = useThreads();

  const initialConfig = liveblocksConfig({
    namespace: 'Editor',
    nodes: [HeadingNode],
    onError: (error: Error) => {
      console.error(error);
      throw error;
    },
    theme: Theme,
    editable: currentUserType === 'editor',
  });

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container size-full">
        <div className="toolbar-wrapper flex min-w-full justify-between">
          <ToolbarPlugin />
          {/* {currentUserType === 'editor' && <DeleteModal roomId={roomId} />} */}
        </div>

        <div className="editor-wrapper flex flex-col items-center justify-start">
          <div className="editor-inner relative mb-5 h-fit min-h-[1100px] w-full max-w-[800px] shadow-md lg:mb-10">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="editor-input h-full" />
              }
              placeholder={<Placeholder />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            {currentUserType === 'editor' && <FloatingToolbarPlugin />}
            <HistoryPlugin />
            <AutoFocusPlugin />
          </div>

          <LiveblocksPlugin>
            <FloatingComposer className="w-[350px]" />
            <FloatingThreads threads={threads} />
            <Comments />
          </LiveblocksPlugin>
        </div>
      </div>
    </LexicalComposer>
  );
}
