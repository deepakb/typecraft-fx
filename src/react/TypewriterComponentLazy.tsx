import { lazy, Suspense } from 'react';
import type { FC } from 'react';
import type { TypewriterComponentProps } from './Typewriter';

const TypewriterComponentLazy = lazy(() =>
  import('./Typewriter').then((module) => ({ default: module.TypewriterComponent }))
);

export const TypewriterComponentWithSuspense: FC<TypewriterComponentProps> = (props) => (
  <Suspense fallback={<div>Loading...</div>}>
    <TypewriterComponentLazy {...props} />
  </Suspense>
);
