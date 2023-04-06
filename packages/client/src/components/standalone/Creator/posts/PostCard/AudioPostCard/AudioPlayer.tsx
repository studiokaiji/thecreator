import Forward10Icon from '@mui/icons-material/Forward10';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Replay10Icon from '@mui/icons-material/Replay10';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { memo, useEffect, useRef, useState } from 'react';

const BeforeMemonizedAudioPlayer = ({ url }: { url: string }) => {
  const audioRef = useRef(new Audio(url));

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const play = () => audioRef.current.play();
  const pause = () => audioRef.current.pause();
  const switchPlayAndPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };
  const stop = () => {
    pause();
    audioRef.current.currentTime = 0;
  };
  const rewind10Sec = () => {
    audioRef.current.currentTime -= 10;
  };
  const forward10Sec = () => {
    audioRef.current.currentTime += 10;
  };

  const attachDuration = () => setDuration(audioRef.current.duration);
  const attachPlaying = () => setIsPlaying(true);
  const attachPause = () => setIsPlaying(false);
  const attachCurrentTime = () => setCurrentTime(audioRef.current.currentTime);

  useEffect(() => {
    audioRef.current.removeEventListener('loadedmetadata', attachDuration);
    audioRef.current.removeEventListener('play', attachPlaying);
    audioRef.current.removeEventListener('pause', attachPause);
    audioRef.current.removeEventListener('timeupdate', attachCurrentTime);

    audioRef.current.addEventListener('loadedmetadata', attachDuration);
    audioRef.current.addEventListener('play', attachPlaying);
    audioRef.current.addEventListener('pause', attachPause);
    audioRef.current.addEventListener('timeupdate', attachCurrentTime);
  }, [audioRef.current]);

  return (
    <Box>
      <Stack
        alignItems="center"
        color="gray"
        direction="row"
        gap={4}
        height={40}
        justifyContent="center"
      >
        <IconButton onClick={rewind10Sec}>
          <Replay10Icon sx={{ fontSize: '1.8rem' }} />
        </IconButton>
        <IconButton onClick={switchPlayAndPause}>
          {isPlaying ? (
            <PauseIcon sx={{ fontSize: '2.55rem' }} />
          ) : (
            <PlayArrowIcon sx={{ fontSize: '2.55rem' }} />
          )}
        </IconButton>
        <IconButton onClick={forward10Sec}>
          <Forward10Icon sx={{ fontSize: '1.8rem' }} />
        </IconButton>
      </Stack>
      <Box>
        <Slider
          max={duration}
          min={0}
          onChange={(_, t) => (audioRef.current.currentTime = Number(t))}
          size="small"
          sx={(theme) => ({
            '& .MuiSlider-thumb': {
              '&:before': {
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
              },
              '&:hover, &.Mui-focusVisible': {
                boxShadow: `0px 0px 0px 8px ${
                  theme.palette.mode === 'dark'
                    ? 'rgb(255 255 255 / 16%)'
                    : 'rgb(0 0 0 / 16%)'
                }`,
              },
              height: 8,
              width: 8,
            },
          })}
          value={currentTime}
        />
        <Box sx={{ pb: 1, position: 'relative' }}>
          <Stack
            alignItems="center"
            direction="row"
            gap={1}
            justifyContent="space-between"
            sx={{
              position: 'absolute',
              top: -11,
              userSelect: 'none',
              width: '100%',
            }}
          >
            <Typography fontSize={12}>{toMinDisplay(currentTime)}</Typography>
            <Typography fontSize={12}>{toMinDisplay(duration)}</Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

const toMinDisplay = (seconds: number) => {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);

  const to0Padding = (n: number) => ('00' + n).slice(-2);

  return `${to0Padding(min)}:${to0Padding(sec)}`;
};

export const AudioPlayer = memo(BeforeMemonizedAudioPlayer);
