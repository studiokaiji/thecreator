const platformToPrefixes = {
  vimeo: ['vimeo.com/'],
  youtube: ['youtube.com/watch?v=', 'youtu.be/', 'youtube.com/embed/'],
} as const;

type IdWithPlatform = {
  id: string;
  platform: keyof typeof platformToPrefixes;
};

export const useVideoIframeParam = (props: JSX.IntrinsicElements['iframe']) => {
  const src = props.src || '';

  const isValidUrl =
    /https:\/\/(?:www\.|player\.)?(vimeo|youtube)\.com\/(?:embed\/|video\/)?(.*?)(?:z|$|\?)/.test(
      src
    );

  const getVideoIdWithPlatform = (): IdWithPlatform | null => {
    if (!isValidUrl) {
      return null;
    }

    const cleaned = src.replace(/^(https?:)?\/\/(www\.)?/, '');

    for (const platform of Object.keys(
      platformToPrefixes
    ) as (keyof typeof platformToPrefixes)[]) {
      const prefixes = platformToPrefixes[platform];

      for (const prefix of prefixes) {
        if (cleaned.startsWith(prefix)) {
          return {
            id: cleaned.substring(prefix.length),
            platform,
          };
        }
      }
    }

    return null;
  };

  const getVideoIframeParam = () => {
    const idWithPlatform = getVideoIdWithPlatform();
    if (!idWithPlatform) {
      return null;
    }

    const embedUrl =
      idWithPlatform.platform === 'vimeo'
        ? `https://player.vimeo.com/video/${idWithPlatform.id}`
        : `https://www.youtube.com/embed/${idWithPlatform.id}`;

    return { ...props, src: embedUrl };
  };

  return getVideoIframeParam();
};
