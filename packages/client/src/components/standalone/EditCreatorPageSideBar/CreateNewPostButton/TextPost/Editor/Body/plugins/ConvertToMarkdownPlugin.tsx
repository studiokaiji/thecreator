import { $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

export const ConvertToMarkdownPlugin = ({
  exportAsMarkdown,
}: {
  exportAsMarkdown?: (contentAsHTML: string) => void;
}) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (exportAsMarkdown) {
      editor.registerUpdateListener(() => {
        editor.update(() => {
          const contentAsMarkdown = $convertToMarkdownString(TRANSFORMERS);
          exportAsMarkdown(contentAsMarkdown);
        });
      });
    }
  }, [editor, exportAsMarkdown]);

  return null;
};
