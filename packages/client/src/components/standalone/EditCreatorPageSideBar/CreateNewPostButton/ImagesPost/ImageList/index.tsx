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

import { UseImageData } from '@/hooks/useImage';

type ImageListProps = {
  images: UseImageData[];
  onChangeImages: (images: UseImageData[]) => void;
};

export const ImageList = ({ images, onChangeImages }: ImageListProps) => {
  const items = [...images.map((data) => ({ ...data, id: data.url }))];

  const onDragEndHandler = ({ active, over }: DragEndEvent) => {
    if (!over) return;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(({ id }) => active.id === id);
      const newIndex = items.findIndex(({ id }) => over.id === id);
      const moved = arrayMove(items, oldIndex, newIndex);
      onChangeImages(moved);
    }
  };

  const remove = (index: number) => {
    onChangeImages(images.filter((_, i) => i !== index));
  };

  const move = (action: ItemCellMoveAction, index: number) => {
    const newIndex =
      action === 'top'
        ? 0
        : action === 'bottom'
        ? images.length - 1
        : action === 'up'
        ? index - 1
        : index + 1;
    const moved = arrayMove(images, index, newIndex);
    onChangeImages(moved);
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
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {images.map(({ url }, i) => (
          <Box key={`post-images-${i}`} mb={3}>
            <ImageCell
              imagesLength={images.length}
              index={i}
              onRequestDelete={() => remove(i)}
              onRequestMove={(action) => move(action, i)}
              src={url}
            />
          </Box>
        ))}
      </SortableContext>
    </DndContext>
  );
};
