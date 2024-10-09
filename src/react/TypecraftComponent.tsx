import React, { useEffect, useRef } from 'react';
import { TypecraftEngine } from '../core/TypecraftEngine';
import { TypecraftOptions } from '../core/types';

export interface TypecraftComponentProps extends TypecraftOptions {
  className?: string;
  style?: React.CSSProperties;
}

export const TypecraftComponent: React.FC<TypecraftComponentProps> = (props) => {
  const { className, style, ...options } = props;
  const elementRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<TypecraftEngine | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      engineRef.current = new TypecraftEngine(elementRef.current, options);
      engineRef.current.start();
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, []);

  return <div ref={elementRef} className={className} style={style} />;
};
