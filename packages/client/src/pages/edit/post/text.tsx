import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';

import { TextPost } from '@/components/standalone/EditCreatorPageSideBar/CreateNewPostButton/TextPost';

export const TextPostPage = () => {
  const { postId } = useParams();
  return (
    <Box m={7} maxWidth={740} mx="auto">
      <TextPost postId={postId} />
    </Box>
  );
};
