import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import Box from '@mui/material/Box';

import { ImageCell, ItemCellMoveAction } from './ImageCell';

type ImageListProps = {
  fileUrls: string[];
  onChangeFileUrls: (urls: string[]) => void;
};

export const ImageList = ({ fileUrls, onChangeFileUrls }: ImageListProps) => {
  const onDragEndHandler = ({ active, over }: DragEndEvent) => {
    if (!over) return;

    const items = [...fileUrls];

    if (active.id !== over?.id) {
      const oldIndex = items.indexOf(String(active.id));
      const newIndex = items.indexOf(String(over?.id));
      const moved = arrayMove(items, oldIndex, newIndex);
      onChangeFileUrls(moved);
    }
  };

  const remove = (index: number) => {
    onChangeFileUrls(fileUrls.filter((_, i) => i !== index));
  };

  const move = (action: ItemCellMoveAction, index: number) => {
    const newIndex =
      action === 'top'
        ? 0
        : action === 'bottom'
        ? fileUrls.length - 1
        : action === 'up'
        ? index - 1
        : index + 1;
    const moved = arrayMove(fileUrls, index, newIndex);
    onChangeFileUrls(moved);
  };

  const sensors = useSensors(
    useSensor(TouchSensor),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={onDragEndHandler}
      sensors={sensors}
    >
      <SortableContext items={fileUrls} strategy={verticalListSortingStrategy}>
        {fileUrls.map((src, i) => (
          <Box key={`post-images-${i}`} mb={3}>
            <ImageCell
              imagesLength={fileUrls.length}
              index={i}
              onRequestDelete={() => remove(i)}
              onRequestMove={(action) => move(action, i)}
              src={src}
            />
          </Box>
        ))}
      </SortableContext>
    </DndContext>
  );
};
