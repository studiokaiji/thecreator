import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ClearIcon from '@mui/icons-material/Clear';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ImagesPostFormInput } from '../ImagesPost';

export type ItemCellMoveAction = 'up' | 'down' | 'top' | 'bottom';

export type ImageCellProps = {
  src: string;
  index?: number;
  onRequestDelete?: () => void;
  onRequestMove?: (action: ItemCellMoveAction, index: number) => void;
  imagesLength?: number;
};

export const ImageCell = ({
  imagesLength = 1,
  index = 0,
  onRequestDelete,
  onRequestMove,
  src,
}: ImageCellProps) => {
  const {
    formState: { errors },
    register,
  } = useFormContext<ImagesPostFormInput>();

  const { t } = useTranslation();

  const toTop = () => onRequestMove && onRequestMove('top', index);
  const toUp = () => onRequestMove && onRequestMove('up', index);
  const toDown = () => onRequestMove && onRequestMove('down', index);
  const toBottom = () => onRequestMove && onRequestMove('bottom', index);

  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: src,
  });

  return (
    <Paper
      ref={setNodeRef}
      elevation={0}
      sx={(theme) => ({
        ':active': {
          cursor: 'grabbing',
        },
        backgroundColor: theme.palette.grey[100],
        border: `1px solid ${theme.palette.grey[400]}`,
        cursor: 'grab',
        transform: CSS.Transform.toString(transform),
        zIndex: 1,
      })}
      {...listeners}
      {...attributes}
      id={src}
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        px={1}
        py={0.5}
        sx={(theme) => ({
          borderBottom: `1px solid ${theme.palette.grey[400]}`,
        })}
        width="100%"
      >
        <Stack alignItems="center" direction="row" gap={1}>
          <Typography fontWeight={500}>{index + 1}</Typography>
          {index < 1 && (
            <Typography
              color="white"
              fontSize={12}
              fontWeight={500}
              sx={(theme) => ({
                backgroundColor: theme.palette.primary.main,
                borderRadius: 20,
                px: 1,
                py: 0.3,
              })}
            >
              {t('thumbnail')}
            </Typography>
          )}
        </Stack>
        <Stack direction="row" gap={1}>
          {imagesLength > 1 && (
            <>
              <IconButton disabled={index < 1} onClick={toTop} size="small">
                <KeyboardDoubleArrowUpIcon />
              </IconButton>
              <IconButton disabled={index < 1} onClick={toUp} size="small">
                <KeyboardArrowUpIcon />
              </IconButton>
              <IconButton
                disabled={imagesLength - 1 <= index}
                onClick={toDown}
                size="small"
              >
                <KeyboardArrowDownIcon />
              </IconButton>
              <IconButton
                disabled={imagesLength - 1 <= index}
                onClick={toBottom}
                size="small"
              >
                <KeyboardDoubleArrowDownIcon />
              </IconButton>
            </>
          )}
          <IconButton onClick={onRequestDelete} size="small">
            <ClearIcon />
          </IconButton>
        </Stack>
      </Stack>
      <Stack p={3} spacing={1}>
        <img height={170} src={src} style={{ objectFit: 'contain' }} />
        <TextField
          label={t('description')}
          {...register(`descriptions.${index}`, {
            maxLength: 255,
          })}
          error={!!errors.descriptions?.[index]?.message}
          helperText={t('validationErrors.maxLength', {
            maxLength: '255',
          })}
          variant="standard"
        />
      </Stack>
    </Paper>
  );
};
