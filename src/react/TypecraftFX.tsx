import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { TypecraftEngine } from '../core/TypecraftEngine';
import { TypecraftOptions } from '../core/types';

export interface TypecraftFXProps extends TypecraftOptions {
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
}

export interface TypecraftFXRef {
  typecraft: TypecraftEngine | null;
}

const defaultStyles = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  lineHeight: 1.5,
};

export interface TypecraftFXRef {
  typecraft: TypecraftEngine | null;
}

export const TypecraftFX = forwardRef<TypecraftFXRef, TypecraftFXProps>((props, ref) => {
  const {
    className,
    style,
    onInit,
    onTypeStart,
    onTypeChar,
    onTypeComplete,
    onDeleteStart,
    onDeleteChar,
    onDeleteComplete,
    onPauseStart,
    onPauseEnd,
    onComplete,
    ...options
  } = props;
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

      const eventHandlers: { [key: string]: ((arg?: any) => void) | undefined } = {
        typeStart: onTypeStart,
        typeChar: onTypeChar,
        typeComplete: onTypeComplete,
        deleteStart: onDeleteStart,
        deleteChar: onDeleteChar,
        deleteComplete: onDeleteComplete,
        pauseStart: onPauseStart,
        pauseEnd: onPauseEnd,
        complete: onComplete,
      };

      Object.entries(eventHandlers).forEach(([event, handler]) => {
        if (handler) {
          engineRef.current?.on(event as any, handler);
        }
      });

      engineRef.current.start();
    }

    return () => {
      if (engineRef.current) {
        // Remove all event listeners
        // engineRef.current.removeAllListeners();
        engineRef.current.stop();
      }
    };
  }, [
    options,
    onInit,
    onTypeStart,
    onTypeChar,
    onTypeComplete,
    onDeleteStart,
    onDeleteChar,
    onDeleteComplete,
    onPauseStart,
    onPauseEnd,
    onComplete,
  ]);

  return <div ref={elementRef} className={className} style={{ ...defaultStyles, ...style }} />;
});

TypecraftFX.displayName = 'TypecraftFX';
