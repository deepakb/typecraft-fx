import React, { lazy, Suspense } from 'react';
import type { FC } from 'react';
import { TypecraftOptions } from '../core/types';

// Define the props for the TypecraftComponent
export interface TypecraftComponentProps extends TypecraftOptions {
  /* eslint-disable-next-line no-unused-vars */
  onInit?: (typecraft: any) => void;
  className?: string;
  style?: React.CSSProperties;
}

// Lazy load the TypecraftComponent
const TypecraftComponentLazy = lazy(() =>
  import('./TypecraftComponent').then((module) => ({ default: module.TypecraftComponent }))
);

// Create a wrapper component that includes Suspense
export const TypecraftComponentWithSuspense: FC<TypecraftComponentProps> = (props) => (
  <Suspense fallback={<div>Loading...</div>}>
    <TypecraftComponentLazy {...props} />
  </Suspense>
);
