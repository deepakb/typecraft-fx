import { useState, useEffect, useRef } from 'react';
import { TypecraftEngine } from '../core/TypecraftEngine';
import { TypecraftOptions, EventCallback, CursorStyle, Direction, TextEffect } from '../core/types';

export interface UseTypecraftFXProps {
  options?: Partial<TypecraftOptions>;
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
  strings: ['Welcome to TypecraftFX'],
  speed: { type: 50, delete: 40, delay: 1500 },
  loop: false,
  autoStart: true,
  cursor: {
    text: '|',
    color: 'black',
    blinkSpeed: 500,
    opacity: { min: 0, max: 1 },
    style: CursorStyle.Solid,
    blink: true,
  },
  pauseFor: 1500,
  direction: Direction.LTR,
  textEffect: TextEffect.None,
  easingFunction: (t) => t,
  html: false,
};

export function useTypecraftFX({
  options = {},
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
}: UseTypecraftFXProps = {}) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const typecraftRef = useRef<TypecraftEngine | null>(null);

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    cursor: {
      ...defaultOptions.cursor,
      ...options.cursor,
    },
    speed: { ...defaultOptions.speed, ...options.speed },
  };

  useEffect(() => {
    if (element && !typecraftRef.current) {
      const instance = new TypecraftEngine(element, mergedOptions);
      typecraftRef.current = instance;

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
      if (typecraftRef.current) {
        typecraftRef.current.stop();

        if (onTypeStart) {
          typecraftRef.current.off('typeStart', onTypeStart);
        }
        if (onTypeChar) {
          typecraftRef.current.off('typeChar', onTypeChar);
        }
        if (onTypeComplete) {
          typecraftRef.current.off('typeComplete', onTypeComplete);
        }
        if (onDeleteStart) {
          typecraftRef.current.off('deleteStart', onDeleteStart);
        }
        if (onDeleteChar) {
          typecraftRef.current.off('deleteChar', onDeleteChar);
        }
        if (onDeleteComplete) {
          typecraftRef.current.off('deleteComplete', onDeleteComplete);
        }
        if (onDeleteSkipped) {
          typecraftRef.current.off('deleteSkipped', onDeleteSkipped);
        }
        if (onPauseStart) {
          typecraftRef.current.off('pauseStart', onPauseStart);
        }
        if (onPauseEnd) {
          typecraftRef.current.off('pauseEnd', onPauseEnd);
        }
        if (onComplete) {
          typecraftRef.current.off('complete', onComplete);
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
    typecraft: typecraftRef.current,
    cursorStyle: mergedOptions.cursor.style,
  };
}
