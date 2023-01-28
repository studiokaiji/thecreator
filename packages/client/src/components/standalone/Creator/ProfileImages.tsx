import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';

const creatorIconSize = 150;

type ProfileImagesProps = {
  headerImageSrc?: string;
  iconImageSrc?: string;
};

export const ProfileImages = ({
  headerImageSrc,
  iconImageSrc,
}: ProfileImagesProps) => (
  <Box
    sx={{
      height: 400,
      position: 'relative',
    }}
  >
    <Box
      component="img"
      src={headerImageSrc}
      sx={{
        backgroundColor: 'lightgray',
        height: 400,
        position: 'absolute',
        width: '100%',
      }}
    />
    <Avatar
      src={iconImageSrc}
      sx={{
        border: '3px solid white',
        borderRadius: '50%',
        bottom: (creatorIconSize / 2.5) * -1,
        height: creatorIconSize,
        left: `calc(50% - ${creatorIconSize / 2}px)`,
        position: 'absolute',
        width: creatorIconSize,
      }}
    />
  </Box>
);
