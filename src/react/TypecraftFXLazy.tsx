import React, { lazy, Suspense } from 'react';
import type { FC } from 'react';
import { TypecraftFXProps } from './TypecraftFX';
import { TypecraftEngine } from '../core/TypecraftEngine';

export interface TypecraftFXLazyProps extends TypecraftFXProps {
  className?: string;
  style?: React.CSSProperties;
  onInit?: (typecraft: TypecraftEngine) => void;
  onTypeStart?: (currentString: string) => void;
  onTypeChar?: (char: string) => void;
  onTypeComplete?: () => void;
  onDeleteStart?: (currentString: string) => void;
  onDeleteChar?: (char: string) => void;
  onDeleteComplete?: () => void;
  onPauseStart?: () => void;
  onPauseEnd?: () => void;
  onComplete?: () => void;
  loadingComponent?: React.ReactNode;
}

const LazyTypecraftFX = lazy(() =>
  import('./TypecraftFX').then((module) => ({ default: module.TypecraftFX }))
);

export const TypecraftFXLazy: FC<TypecraftFXLazyProps> = ({
  loadingComponent = <div>Loading...</div>,
  ...props
}) => (
  <Suspense fallback={loadingComponent}>
    <LazyTypecraftFX {...props} />
  </Suspense>
);
