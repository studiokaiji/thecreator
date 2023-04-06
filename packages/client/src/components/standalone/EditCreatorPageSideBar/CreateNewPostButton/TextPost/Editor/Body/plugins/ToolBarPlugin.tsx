import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createHeadingNode,
  $isHeadingNode,
  HeadingTagType,
} from '@lexical/rich-text';
import { $isAtNodeEnd, $wrapNodes } from '@lexical/selection';
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  mergeRegister,
} from '@lexical/utils';
import AddIcon from '@mui/icons-material/Add';
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined';
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import TitleIcon from '@mui/icons-material/Title';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_CRITICAL,
  DEPRECATED_$isGridSelection,
  ElementNode,
  LexicalEditor,
  RangeSelection,
  SELECTION_CHANGE_COMMAND,
  TextNode,
} from 'lexical';
import {
  ChangeEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { INSERT_IMAGE_COMMAND } from './ImagePlugin';

import { useImage } from '@/hooks/useImage';

const blockTypeToBlockName = {
  bullet: 'Bulleted List',
  check: 'Check List',
  code: 'Code Block',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  number: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote',
};

function BlockFormatDropDown({
  blockType,
  disabled = false,
  editor,
}: {
  blockType: keyof typeof blockTypeToBlockName;
  editor: LexicalEditor;
  disabled?: boolean;
}) {
  const { createImage } = useImage();

  const onChangeFileHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    const image = createImage(file, 'images');

    editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
      altText: '',
      src: image.url,
    });
  };

  /*
  const formatParagraph = () => {
    if (blockType !== 'paragraph') {
      editor.update(() => {
        const selection = $getSelection();
        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        ) {
          //   setBlocksTypeExperimental(selection, () => $createParagraphNode())
        }
      });
    }
  };
  */

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        ) {
          $wrapNodes(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpenMenu = !!anchorEl;

  const openMenu = (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    setAnchorEl(e.currentTarget);
  };
  const closeMenu = () => setAnchorEl(null);

  const uploadMenuCellId = 'editor-toolbar-image-upload-menu-cell-label';

  const { t } = useTranslation();

  return (
    <>
      <IconButton
        disabled={disabled}
        onClick={openMenu}
        sx={() => ({
          border: '1px solid',
          height: 40,
          width: 40,
        })}
      >
        <AddIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        onClick={closeMenu}
        onClose={closeMenu}
        open={isOpenMenu}
      >
        <label htmlFor={uploadMenuCellId}>
          <MenuItem>
            <ListItemIcon>
              <ImageOutlinedIcon />
            </ListItemIcon>
            {t('image')}
          </MenuItem>
        </label>
        <MenuItem onClick={() => formatHeading('h2')}>
          <ListItemIcon>
            <TitleIcon />
          </ListItemIcon>
          {t('heading')}
        </MenuItem>
        <MenuItem onClick={() => formatHeading('h3')}>
          <ListItemIcon>
            <TitleIcon fontSize="small" />
          </ListItemIcon>
          {t('subHeading')}
        </MenuItem>
        <MenuItem onClick={formatBulletList}>
          <ListItemIcon>
            <FormatListBulletedOutlinedIcon />
          </ListItemIcon>
          {t('bulletList')}
        </MenuItem>
        <MenuItem onClick={formatNumberedList}>
          <ListItemIcon>
            <FormatListNumberedOutlinedIcon />
          </ListItemIcon>
          {t('numberedList')}
        </MenuItem>
      </Menu>
      <input
        accept="image/*"
        id={uploadMenuCellId}
        onChange={onChangeFileHandler}
        style={{ display: 'none' }}
        type="file"
      />
    </>
  );
}

export function getSelectedNode(
  selection: RangeSelection
): TextNode | ElementNode {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
  }
}

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [blockType, setBlockType] =
    useState<keyof typeof blockTypeToBlockName>('paragraph');
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [focusedBlockTop, setFocusedBlockTop] = useState(0);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode
          );
          const type =
            parentList != null
              ? parentList.getListType()
              : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
        }
        setFocusedBlockTop(Number(elementDOM?.offsetTop));
      }
    }
  }, [activeEditor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      })
    );
  }, [activeEditor, editor, updateToolbar]);

  return (
    <>
      {blockType in blockTypeToBlockName && activeEditor === editor && (
        <div style={{ position: 'absolute', top: focusedBlockTop }}>
          <BlockFormatDropDown
            blockType={blockType}
            disabled={!isEditable}
            editor={editor}
          />
        </div>
      )}
    </>
  );
}
