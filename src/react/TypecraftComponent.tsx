import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { TypecraftEngine } from '../core/TypecraftEngine';
import { TypecraftOptions } from '../core/types';

export interface TypecraftComponentProps extends TypecraftOptions {
  className?: string;
  style?: React.CSSProperties;
  /* eslint-disable-next-line no-unused-vars */
  onInit?: (typecraft: TypecraftEngine) => void;
}

const defaultStyles = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  lineHeight: 1.5,
};

export interface TypecraftComponentRef {
  typecraft: TypecraftEngine | null;
}

export const TypecraftComponent = forwardRef<TypecraftComponentRef, TypecraftComponentProps>(
  (props, ref) => {
    const { className, style, onInit, ...options } = props;
    const elementRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<TypecraftEngine | null>(null);

    useImperativeHandle(ref, () => ({
      get typecraft() {
        return engineRef.current;
      },
    }));

    useEffect(() => {
      if (elementRef.current) {
        engineRef.current = new TypecraftEngine(elementRef.current, options);
        if (onInit) {
          onInit(engineRef.current);
        }
        engineRef.current.start();
      }

      return () => {
        if (engineRef.current) {
          engineRef.current.stop();
        }
      };
    }, []);

    return <div ref={elementRef} className={className} style={{ ...defaultStyles, ...style }} />;
  }
);

TypecraftComponent.displayName = 'TypecraftComponent';
