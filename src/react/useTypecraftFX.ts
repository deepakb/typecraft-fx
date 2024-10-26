import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { TypecraftEngine } from '../core/TypecraftEngine';
import { TypecraftOptions, EventCallback, TypecraftEvent } from '../types';
import { DEFAULT_OPTIONS } from '../constants';
import { ManagerFactory } from '../core/factories/ManagerFactory';
import { ErrorHandler } from '../utils/ErrorHandler';
import { logger } from '../core/TypecraftLogger';

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
      ...DEFAULT_OPTIONS,
      ...options,
      cursor: { ...DEFAULT_OPTIONS.cursor, ...options.cursor },
      speed: { ...DEFAULT_OPTIONS.speed, ...options.speed },
    }),
    [options]
  );

  // Helper to attach event listeners
  const attachEventListeners = useCallback(
    (instance: TypecraftEngine) => {
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
    },
    [
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
    ]
  );

  useEffect(() => {
    if (!element || typecraftRef.current) {
      return;
    }

    const managerFactory = new ManagerFactory(logger);
    const errorHandler = new ErrorHandler(logger);
    const instance = new TypecraftEngine(
      element,
      mergedOptions,
      logger,
      errorHandler,
      managerFactory
    );
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
  }, [element, mergedOptions, onInit, attachEventListeners]);

  return {
    setElement,
    typecraft: typecraftRef.current,
    cursorStyle: mergedOptions.cursor.style,
  };
}
