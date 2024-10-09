import { useState, useEffect, useRef } from 'react';
import { TypecraftEngine } from '../core/TypecraftEngine';
import { TypecraftOptions, EventCallback, CursorStyle, Direction, TextEffect } from '../core/types';

export interface UseTypecraftProps {
  options?: Partial<TypecraftOptions>;
  /* eslint-disable-next-line no-unused-vars */
  onInit?: (typecraft: TypecraftEngine) => void;
  onTypeStart?: EventCallback;
  onTypeChar?: EventCallback;
  onTypeComplete?: EventCallback;
  onDeleteStart?: EventCallback;
  onDeleteChar?: EventCallback;
  onDeleteComplete?: EventCallback;
  onDeleteSkipped?: EventCallback;
  onPauseStart?: EventCallback;
  onPauseEnd?: EventCallback;
  onComplete?: EventCallback;
}

const defaultOptions: TypecraftOptions = {
  strings: [],
  speed: 50,
  loop: false,
  autoStart: false,
  cursor: {
    text: '|',
    color: 'black',
    blinkSpeed: 500,
    opacity: { min: 0, max: 1 },
    style: CursorStyle.Solid,
    blink: false,
  },
  pauseFor: 1500,
  direction: Direction.LTR,
  textEffect: TextEffect.None,
  easingFunction: (t) => t,
  html: false,
};

export function useTypecraft({
  options,
  onInit,
  onTypeStart,
  onTypeChar,
  onTypeComplete,
  onDeleteStart,
  onDeleteChar,
  onDeleteComplete,
  onDeleteSkipped,
  onPauseStart,
  onPauseEnd,
  onComplete,
}: UseTypecraftProps = {}) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const TypecraftRef = useRef<TypecraftEngine | null>(null);

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    cursor: {
      ...defaultOptions.cursor,
      ...options?.cursor,
    },
  };

  useEffect(() => {
    if (element && !TypecraftRef.current) {
      const instance = new TypecraftEngine(element, mergedOptions);
      TypecraftRef.current = instance;

      if (onInit) {
        onInit(instance);
      }

      // Set up event listeners
      if (onTypeStart) {
        instance.on('typeStart', onTypeStart);
      }
      if (onTypeChar) {
        instance.on('typeChar', onTypeChar);
      }
      if (onTypeComplete) {
        instance.on('typeComplete', onTypeComplete);
      }
      if (onDeleteStart) {
        instance.on('deleteStart', onDeleteStart);
      }
      if (onDeleteChar) {
        instance.on('deleteChar', onDeleteChar);
      }
      if (onDeleteComplete) {
        instance.on('deleteComplete', onDeleteComplete);
      }
      if (onDeleteSkipped) {
        instance.on('deleteSkipped', onDeleteSkipped);
      }
      if (onPauseStart) {
        instance.on('pauseStart', onPauseStart);
      }
      if (onPauseEnd) {
        instance.on('pauseEnd', onPauseEnd);
      }
      if (onComplete) {
        instance.on('complete', onComplete);
      }
    }

    return () => {
      if (TypecraftRef.current) {
        TypecraftRef.current.stop();
        // Remove event listeners
        if (onTypeStart) {
          TypecraftRef.current.off('typeStart', onTypeStart);
        }
        if (onTypeChar) {
          TypecraftRef.current.off('typeChar', onTypeChar);
        }
        if (onTypeComplete) {
          TypecraftRef.current.off('typeComplete', onTypeComplete);
        }
        if (onDeleteStart) {
          TypecraftRef.current.off('deleteStart', onDeleteStart);
        }
        if (onDeleteChar) {
          TypecraftRef.current.off('deleteChar', onDeleteChar);
        }
        if (onDeleteComplete) {
          TypecraftRef.current.off('deleteComplete', onDeleteComplete);
        }
        if (onDeleteSkipped) {
          TypecraftRef.current.off('deleteSkipped', onDeleteSkipped);
        }
        if (onPauseStart) {
          TypecraftRef.current.off('pauseStart', onPauseStart);
        }
        if (onPauseEnd) {
          TypecraftRef.current.off('pauseEnd', onPauseEnd);
        }
        if (onComplete) {
          TypecraftRef.current.off('complete', onComplete);
        }
      }
    };
  }, [
    element,
    mergedOptions,
    onInit,
    onTypeStart,
    onTypeChar,
    onTypeComplete,
    onDeleteStart,
    onDeleteChar,
    onDeleteComplete,
    onDeleteSkipped,
    onPauseStart,
    onPauseEnd,
    onComplete,
  ]);

  return {
    setElement,
    typecraft: TypecraftRef.current,
    cursorStyle: mergedOptions.cursor.style,
  };
}
