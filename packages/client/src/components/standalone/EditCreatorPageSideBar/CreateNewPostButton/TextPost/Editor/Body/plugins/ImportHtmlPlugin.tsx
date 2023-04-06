import { $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $insertNodes } from 'lexical';
import { FC, useEffect } from 'react';

export const ImportHtmlPlugin: FC<{
  defaultContentAsHTML?: string;
}> = ({ defaultContentAsHTML }) => {
  const [editor] = useLexicalComposerContext();
  let isInserted = false;

  useEffect(() => {
    if (typeof defaultContentAsHTML === 'undefined') return;

    editor.update(() => {
      if (isInserted) return;

      const parser = new DOMParser();
      const textHtmlMimeType: DOMParserSupportedType = 'text/html';
      const dom = parser.parseFromString(
        defaultContentAsHTML,
        textHtmlMimeType
      );
      const nodes = $generateNodesFromDOM(editor, dom);
      $getRoot().select();
      $insertNodes(nodes);

      isInserted = true;
    });
  }, [editor, defaultContentAsHTML]);

  return null;
};
