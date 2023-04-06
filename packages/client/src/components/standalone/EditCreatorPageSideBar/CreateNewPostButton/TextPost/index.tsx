import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Editor, EditorData } from './Editor';

import { useCreatorOwnTextPost } from '@/hooks/useCreatorOwnTextPost';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useSnackbar } from '@/hooks/useSnackbar';

type TextPostProps = {
  postId?: string;
};

export const TextPost = (props: TextPostProps) => {
  const { currentUser } = useCurrentUser();

  const { t } = useTranslation();

  const navigate = useNavigate();

  const [postId, setPostId] = useState(props.postId);

  useEffect(() => {
    if (!postId) {
      save(false, false);
    }
    if (postId && postId !== props.postId) {
      navigate(`/edit/post/text/${postId}`);
    }
  }, [postId]);

  const back = async () => {
    await save();
    if (!currentUser?.uid) {
      navigate(-1);
    }
    navigate(`/c/${currentUser?.uid}/posts/${postId}`);
  };

  const {
    data: postData,
    error: postDataErr,
    save: saveTextPost,
  } = useCreatorOwnTextPost(postId);

  const { open: openSnackbar } = useSnackbar();

  const [editorData, setEditorData] = useState<EditorData>({
    bodyMarkdown: postData?.bodyMarkdown || '',
    title: postData?.title || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errMessage, setErrMessage] = useState('');

  const save = async (publish?: boolean, snackbar = true) => {
    setIsSaving(true);
    try {
      const id = await saveTextPost({
        ...editorData,
        isPublic: publish || postData?.isPublic,
      });
      setPostId(id);
    } catch (e) {
      setErrMessage(String(e));
      return;
    }
    snackbar && openSnackbar(t('saveSuccessed'));
    setIsSaving(false);
  };

  if (postDataErr.bodyMarkdown || postDataErr.post) {
    return <div>{JSON.stringify(postDataErr)}</div>;
  }

  const isLoading = !postId || (!postData && !postDataErr);
  if (isLoading) {
    return <></>;
  }

  return (
    <>
      <Stack spacing={7}>
        <Stack
          alignItems={'center'}
          direction="row"
          justifyContent="space-between"
        >
          <IconButton onClick={back}>
            <ArrowBackIcon />
          </IconButton>
          <Stack direction="row" gap={2}>
            <Button
              onClick={() => save()}
              startIcon={<SaveOutlinedIcon />}
              variant="outlined"
            >
              {t('save')}
            </Button>
            {!postData?.isPublic && (
              <Button
                onClick={() => save(true)}
                startIcon={<SendOutlinedIcon />}
                variant="contained"
              >
                {t('publish')}
              </Button>
            )}
          </Stack>
        </Stack>
        <Editor
          onChange={setEditorData}
          saved={{
            bodyMarkdown: postData?.bodyMarkdown || '',
            thumbnailUrl: postData?.thumbnailUrl || '',
            title: postData?.title || '',
          }}
        />
      </Stack>
      <Dialog open={isSaving}>
        <DialogContent>
          <Stack
            height="100%"
            justifyContent="center"
            minHeight={100}
            minWidth={180}
            spacing={1.5}
          >
            {errMessage ? (
              <>
                <HighlightOffOutlinedIcon color="error" />
                <Typography component="pre" textAlign="center">
                  {errMessage}
                </Typography>
              </>
            ) : (
              <>
                <CircularProgress sx={{ display: 'block', mx: 'auto' }} />
                <Typography textAlign="center">{t('saving')}</Typography>
              </>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};
