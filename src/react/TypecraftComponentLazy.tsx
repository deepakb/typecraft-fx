import { lazy, Suspense } from 'react';
import type { FC } from 'react';
import { UseTypecraftProps } from './useTypecraft';
import { TypecraftOptions } from '../core/types';

const TypecraftComponentLazy = lazy(() =>
  import('./TypecraftComponent').then((module) => ({ default: module.TypecraftComponent }))
);

type TypecraftComponentProps = Omit<UseTypecraftProps, 'options'> & {
  options?: TypecraftOptions;
};

export const TypecraftComponentWithSuspense: FC<UseTypecraftProps> = (props) => {
  const { options, ...restProps } = props;
  const componentProps: TypecraftComponentProps = {
    ...restProps,
    options: options as TypecraftOptions,
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TypecraftComponentLazy {...componentProps} />
    </Suspense>
  );
};
