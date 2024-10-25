import { useState, useEffect, useRef, useMemo } from 'react';
import { TypecraftEngine } from '../core/TypecraftEngine';
import {
  TypecraftOptions,
  EventCallback,
  CursorStyle,
  Direction,
  TextEffect,
  TypecraftEvent,
} from '../core/types';

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

  // Memoize options to prevent unnecessary re-renders and recalculations.
  const mergedOptions = useMemo(
    () => ({
      ...defaultOptions,
      ...options,
      cursor: { ...defaultOptions.cursor, ...options.cursor },
      speed: { ...defaultOptions.speed, ...options.speed },
    }),
    [options]
  );

  // Helper to attach event listeners
  const attachEventListeners = (instance: TypecraftEngine) => {
    const eventHandlers: Partial<Record<TypecraftEvent, EventCallback>> = {
      typeStart: onTypeStart,
      typeChar: onTypeChar,
      typeComplete: onTypeComplete,
      deleteStart: onDeleteStart,
      deleteChar: onDeleteChar,
      deleteComplete: onDeleteComplete,
      deleteSkipped: onDeleteSkipped,
      pauseStart: onPauseStart,
      pauseEnd: onPauseEnd,
      complete: onComplete,
    };

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      if (handler) {
        instance.on(event as TypecraftEvent, handler);
      }
    });

    return () => {
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        if (handler) {
          instance.off(event as TypecraftEvent, handler);
        }
      });
    };
  };

  useEffect(() => {
    if (!element || typecraftRef.current) {
      return; // Early return if element is not ready or instance already exists.
    }

    const instance = new TypecraftEngine(element, mergedOptions);
    typecraftRef.current = instance;

    if (onInit) {
      onInit(instance);
    }

    const cleanupEventListeners = attachEventListeners(instance);

    // Auto start typing effect if enabled.
    if (mergedOptions.autoStart) {
      instance.start();
    }

    // Cleanup: stop instance and detach event listeners.
    return () => {
      instance.stop();
      cleanupEventListeners();
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
