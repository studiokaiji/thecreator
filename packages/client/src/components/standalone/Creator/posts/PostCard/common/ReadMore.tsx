import { PropsWithChildren } from 'react';

import { SeeMore } from '@/components/helpers/SeeMore';

export const ReadMore = ({
  children,
  href,
}: PropsWithChildren & { href: string }) => {
  return (
    <SeeMore heightOnMinimized={100} href={href} mode="link">
      {children}
    </SeeMore>
  );
};
