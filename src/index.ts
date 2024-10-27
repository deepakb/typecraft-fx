import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { TypecraftFXProps, TypecraftFXRef } from './react/TypecraftFX';

export { TypecraftEngine } from './core/TypecraftEngine';
export { Direction, CursorStyle, TextEffect } from './types';
export type { TypecraftOptions } from './types';
export { useTypecraftFX } from './react/useTypecraftFX';

export const TypecraftFX: () => Promise<{
  default: ForwardRefExoticComponent<TypecraftFXProps & RefAttributes<TypecraftFXRef>>;
}> = () => import('./react/TypecraftFX').then((m) => ({ default: m.TypecraftFX }));

export const TypecraftFXLazy = () =>
  import('./react/TypecraftFXLazy').then((m) => m.TypecraftFXLazy);
