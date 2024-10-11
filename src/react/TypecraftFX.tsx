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

      if (onTypeStart) {
        engineRef.current.on('typeStart', onTypeStart);
      }
      if (onTypeChar) {
        engineRef.current.on('typeChar', onTypeChar);
      }
      if (onTypeComplete) {
        engineRef.current.on('typeComplete', onTypeComplete);
      }
      if (onDeleteStart) {
        engineRef.current.on('deleteStart', onDeleteStart);
      }
      if (onDeleteChar) {
        engineRef.current.on('deleteChar', onDeleteChar);
      }
      if (onDeleteComplete) {
        engineRef.current.on('deleteComplete', onDeleteComplete);
      }
      if (onPauseStart) {
        engineRef.current.on('pauseStart', onPauseStart);
      }
      if (onPauseEnd) {
        engineRef.current.on('pauseEnd', onPauseEnd);
      }
      if (onComplete) {
        engineRef.current.on('complete', onComplete);
      }

      engineRef.current.start();
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.off('typeStart', () => {});
        engineRef.current.off('typeChar', () => {});
        engineRef.current.off('typeComplete', () => {});
        engineRef.current.off('deleteStart', () => {});
        engineRef.current.off('deleteChar', () => {});
        engineRef.current.off('deleteComplete', () => {});
        engineRef.current.off('pauseStart', () => {});
        engineRef.current.off('pauseEnd', () => {});
        engineRef.current.off('complete', () => {});

        engineRef.current.stop();
      }
    };
  }, []);

  return <div ref={elementRef} className={className} style={{ ...defaultStyles, ...style }} />;
});

TypecraftFX.displayName = 'TypecraftFX';
