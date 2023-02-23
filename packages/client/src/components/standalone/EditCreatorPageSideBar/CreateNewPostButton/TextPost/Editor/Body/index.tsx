import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { TRANSFORMERS } from '@lexical/markdown';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';

import { ImageNode } from './nodes/ImageNode';
import { ExportHtmlPlugin } from './plugins/ExportHtmlPlugin';
import { ImagePlugin } from './plugins/ImagePlugin';
import { ImportHtmlPlugin } from './plugins/ImportHtmlPlugin';
import { ToolbarPlugin } from './plugins/ToolBarPlugin';
import { theme } from './theme';

const editorConfig = {
  namespace: '',
  nodes: [
    HeadingNode,
    ListNode,
    ImageNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
  ],
  onError(error: Error) {
    throw error;
  },
  theme,
};

type EditorBodyProps = {
  defaultBodyHtml?: string;
  onChangeBodyHtml: (html: string) => void;
};

export const EditorBody = ({
  defaultBodyHtml,
  onChangeBodyHtml,
}: EditorBodyProps) => {
  const { t } = useTranslation();

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <Box sx={{ minHeight: 240, position: 'relative' }}>
        <Box sx={{ position: 'relative' }}>
          <Box>
            <ToolbarPlugin />
          </Box>
          <Box
            sx={{
              left: 56,
              margin: 0,
              position: 'absolute',
              width: 'calc(100% - 56px)',
            }}
          >
            <RichTextPlugin
              ErrorBoundary={LexicalErrorBoundary}
              contentEditable={
                <ContentEditable
                  style={{
                    lineHeight: '40px',
                    outline: 'none',
                    position: 'absolute',
                    top: 0,
                    width: '100%',
                  }}
                />
              }
              placeholder={
                <Box
                  sx={(theme) => ({
                    color: theme.palette.grey[700],
                    fontSize: '1.1rem',
                    pointerEvents: 'none',
                    position: 'absolute',
                    top: 25,
                    userSelect: 'none',
                  })}
                >
                  {t('writeAnythingHere')}
                </Box>
              }
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <ListPlugin />
            <LinkPlugin />
            <ImagePlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <ImportHtmlPlugin defaultContentAsHTML={defaultBodyHtml} />
            <ExportHtmlPlugin exportAsHTML={onChangeBodyHtml} />
          </Box>
        </Box>
      </Box>
    </LexicalComposer>
  );
};
