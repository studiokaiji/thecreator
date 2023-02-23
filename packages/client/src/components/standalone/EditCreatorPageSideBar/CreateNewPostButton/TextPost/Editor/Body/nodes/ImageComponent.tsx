import type { LexicalEditor, NodeKey } from 'lexical';
import { Suspense, useRef } from 'react';

const imageCache = new Set();

function useSuspenseImage(src: string) {
  if (!imageCache.has(src)) {
    throw new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imageCache.add(src);
        resolve(null);
      };
    });
  }
}

function LazyImage({
  altText,
  className,
  height,
  imageRef,
  maxWidth,
  src,
  width,
}: {
  altText: string;
  className: string | null;
  height: 'inherit' | number;
  imageRef: { current: null | HTMLImageElement };
  maxWidth: number;
  src: string;
  width: 'inherit' | number;
}): JSX.Element {
  useSuspenseImage(src);
  return (
    <img
      ref={imageRef}
      alt={altText}
      className={className || undefined}
      src={src}
      style={{
        height,
        maxWidth,
        width,
      }}
    />
  );
}

export default function ImageComponent({
  altText,
  height,
  maxWidth,
  src,
  width,
}: {
  altText: string;
  caption: LexicalEditor;
  height: 'inherit' | number;
  maxWidth: number;
  nodeKey: NodeKey;
  resizable: boolean;
  showCaption: boolean;
  src: string;
  width: 'inherit' | number;
  captionsEnabled: boolean;
}): JSX.Element {
  const imageRef = useRef<null | HTMLImageElement>(null);

  return (
    <Suspense fallback={null}>
      <>
        <div>
          <LazyImage
            altText={altText}
            className=""
            height={height}
            imageRef={imageRef}
            maxWidth={maxWidth}
            src={src}
            width={width}
          />
        </div>
      </>
    </Suspense>
  );
}
