import React, { lazy, Suspense, memo } from 'react';
import type { FC } from 'react';
import { TypecraftFXProps } from './TypecraftFX';
import { TypecraftEngine } from '../core/TypecraftEngine';

// Define prop types for the lazy-loaded TypecraftFX component
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

// Lazy-load the TypecraftFX component
const LazyTypecraftFX = lazy(() =>
  import('./TypecraftFX').then((module) => ({ default: module.TypecraftFX }))
);

// The lazy-loaded TypecraftFX component wrapped with Suspense and memo for optimization
export const TypecraftFXLazy: FC<TypecraftFXLazyProps> = memo(
  ({
    loadingComponent = <div aria-label="Loading TypecraftFX">Loading...</div>, // Default loading fallback component
    ...props // Spread other props to be passed to the TypecraftFX component
  }) => (
    <Suspense fallback={loadingComponent}>
      <LazyTypecraftFX {...props} />
    </Suspense>
  )
);

// Memoized component for performance optimization (prevents unnecessary re-renders)
TypecraftFXLazy.displayName = 'TypecraftFXLazy'; // Helpful for debugging
