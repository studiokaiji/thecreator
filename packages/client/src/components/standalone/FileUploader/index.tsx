import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { Accept, DropzoneOptions, useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

type UploaderType = 'images' | 'thumbnail' | 'audio';

type FileUploaderProps = {
  customMessage?: string;
  type: UploaderType;
  customAccept?: Accept;
  onRetriveValidFiles?: <T extends File>(file: T[]) => void;
};

const uploaderSettings: {
  [uploaderType in UploaderType]: DropzoneOptions;
} = {
  audio: {
    accept: {
      'audio/aac': ['.aac'],
      'audio/mp3': ['.mp3'],
    },
    maxFiles: 1,
    maxSize: 104857600, // 100MB
  },
  images: {
    accept: {
      'image/gif': ['.gif'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
    },
    maxFiles: 30,
    maxSize: 10485760, // 10MB,
  },
  thumbnail: {
    accept: {
      'image/gif': ['.gif'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    maxSize: 10485760, // 10MB,
  },
};

export const FileUploader = ({
  customAccept,
  customMessage,
  onRetriveValidFiles,
  type,
}: FileUploaderProps) => {
  const settings = uploaderSettings[type];
  const accept = customAccept || settings.accept || {};

  const { acceptedFiles, fileRejections, getInputProps, getRootProps } =
    useDropzone({
      ...settings,
      accept,
      noClick: false,
    });

  const removeAll = () => {
    acceptedFiles.length = 0;
    acceptedFiles.splice(0, acceptedFiles.length);
    fileRejections.length = 0;
    fileRejections.splice(0, fileRejections.length);
  };

  useEffect(() => {
    if (!acceptedFiles || !acceptedFiles.length || !onRetriveValidFiles) return;
    onRetriveValidFiles(acceptedFiles);
    removeAll();
  }, [acceptedFiles]);

  const { t } = useTranslation();
  if (fileRejections && fileRejections.length) {
    alert(t('invalidFaileSelectedMessage'));
    removeAll();
  }

  const message = customMessage || t('clickOrDragAndDropToAddFiles');

  return (
    <Stack
      p={4}
      spacing={0.5}
      sx={(theme) => ({
        ':hover': {
          backgroundColor: theme.palette.grey[50],
        },
        border: '2px dotted',
        borderColor: theme.palette.grey[700],
        userSelect: 'none',
      })}
      textAlign="center"
      {...getRootProps()}
    >
      <Typography fontWeight={500}>{message}</Typography>
      <Typography color="gray" variant="body2">
        {t(`uploaderSubMessages.${type}`)}
      </Typography>
      <input {...getInputProps()} />
    </Stack>
  );
};
