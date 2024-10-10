import React, { lazy, Suspense } from 'react';
import type { FC } from 'react';
import { TypecraftOptions } from '../core/types';

export interface TypecraftComponentProps extends TypecraftOptions {
  /* eslint-disable-next-line no-unused-vars */
  onInit?: (typecraft: any) => void;
  className?: string;
  style?: React.CSSProperties;
  loadingComponent?: React.ReactNode;
}

const TypecraftComponentLazy = lazy(() =>
  import('./TypecraftComponent').then((module) => ({ default: module.TypecraftComponent }))
);

export const TypecraftComponentWithSuspense: FC<TypecraftComponentProps> = ({
  loadingComponent = <div>Loading...</div>,
  ...props
}) => (
  <Suspense fallback={loadingComponent}>
    <TypecraftComponentLazy {...props} />
  </Suspense>
);
