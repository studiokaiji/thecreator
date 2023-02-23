import { $generateHtmlFromNodes } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FC, useEffect } from 'react';

export const ExportHtmlPlugin: FC<{
  exportAsHTML?: (contentAsHTML: string) => void;
}> = ({ exportAsHTML }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (exportAsHTML) {
      editor.registerUpdateListener(() => {
        editor.update(() => {
          const contentAsHTML = $generateHtmlFromNodes(editor);
          exportAsHTML(contentAsHTML);
        });
      });
    }
  }, [editor, exportAsHTML]);

  return null;
};
