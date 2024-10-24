import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { TypecraftEngine } from '../core/TypecraftEngine';
import { Direction, TextEffect, TypecraftOptions } from '../core/types';
import { ErrorCode, TypecraftError } from '../core/TypecraftError';
import { logger } from '../core/TypecraftLogger';

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
    className = 'typecraft-fx',
    style = {},
    autoStart = true,
    speed = { type: 50, delete: 40, delay: 1500 },
    textEffect = TextEffect.None,
    direction = Direction.LTR,
    loop = false,
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
      try {
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

        if (autoStart) {
          engineRef.current.start();
        }
      } catch (error) {
        if (error instanceof TypecraftError) {
          logger.error(error.code, error.message, error.details);
        } else {
          logger.error(ErrorCode.RUNTIME_ERROR, 'Unexpected error in TypecraftFX:', error as any);
        }
      }
    }

    return () => {
      if (engineRef.current) {
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
