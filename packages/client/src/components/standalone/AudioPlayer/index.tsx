import { RefObject, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

type AudioPlayerProps = {
  url: string;
};

export const AudioPlayer = ({ url }: AudioPlayerProps) => {
  const waveformRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!waveformRef.current) return;
    waveformRef.current = WaveSurfer.create({
      container: waveformRef.current as unknown as HTMLElement,
    });
    waveformRef.current.load(url);
  }, [waveformRef]);

  return (
    <>
      <div ref={waveformRef as unknown as RefObject<HTMLDivElement>} />
    </>
  );
};
