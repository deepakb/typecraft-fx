import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useCallback,
} from 'react';
import { TypecraftEngine } from '../core/TypecraftEngine';
import { CursorStyle, Direction, TextEffect, TypecraftOptions } from '../core/types';
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

// Default styles outside the component to avoid re-creation
const defaultStyles = {
  fontFamily: 'Helvetica, sans-serif',
  fontSize: '18px',
  lineHeight: 1.6,
  color: '#333',
};

// Function to safely initialize the Typecraft engine
const initializeEngine = (
  element: HTMLElement,
  options: TypecraftOptions,
  onInit?: (engine: TypecraftEngine) => void
) => {
  try {
    const engine = new TypecraftEngine(element, options);
    onInit?.(engine);
    return engine;
  } catch (error) {
    if (error instanceof TypecraftError) {
      logger.error(error.code, error.message, error.details);
    } else {
      logger.error(ErrorCode.RUNTIME_ERROR, 'Unexpected error in TypecraftFX:', { error });
    }
    return null;
  }
};

// Main component
export const TypecraftFX = forwardRef<TypecraftFXRef, TypecraftFXProps>((props, ref) => {
  const {
    className = 'typecraft-fx', // Default className
    style = {}, // Default style
    autoStart = true, // Default autoStart value
    speed = { type: 50, delete: 40, delay: 1500 }, // Default speed values
    textEffect = TextEffect.None, // Default textEffect
    direction = Direction.LTR, // Default direction
    loop = false, // Default loop
    pauseFor = 1500, // Default pauseFor
    html = false, // Default html
    cursor = {
      style: CursorStyle.Solid,
      color: '#333',
      text: '|',
      blinkSpeed: 1000,
      opacity: { min: 0, max: 1 },
      blink: true,
    }, // Default cursor settings
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
    ...propsOptions
  } = props;

  const elementRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<TypecraftEngine | null>(null);

  // Expose the Typecraft engine via ref
  useImperativeHandle(ref, () => ({ typecraft: engineRef.current }));

  const mergedStyles = useMemo(() => ({ ...defaultStyles, ...style }), [style]);

  const options = useMemo(
    () => ({
      autoStart,
      speed,
      textEffect,
      direction,
      loop,
      pauseFor,
      html,
      cursor,
      ...propsOptions,
    }),
    [autoStart, speed, textEffect, direction, loop, pauseFor, html, cursor, propsOptions]
  );

  // Initialize engine on mount
  useEffect(() => {
    if (elementRef.current) {
      engineRef.current = initializeEngine(elementRef.current, options, onInit);
      if (autoStart) {
        engineRef.current?.start();
      }
    }
    return () => {
      engineRef.current?.stop();
    };
  }, [options, onInit, autoStart]);

  // Register event handlers using a callback
  const registerEventHandlers = useCallback(
    (engine: TypecraftEngine | null) => {
      if (!engine) {
        return;
      }

      const eventHandlers = {
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
          engine.on(event as any, handler);
        }
      });

      return () => {
        Object.entries(eventHandlers).forEach(([event, handler]) => {
          if (handler) {
            engine.off(event as any, handler);
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
      onPauseStart,
      onPauseEnd,
      onComplete,
    ]
  );

  // Attach and clean up event handlers
  useEffect(() => {
    if (engineRef.current) {
      const cleanup = registerEventHandlers(engineRef.current);
      return cleanup;
    }
  }, [registerEventHandlers]);

  return <div ref={elementRef} className={className} style={mergedStyles} />;
});

TypecraftFX.displayName = 'TypecraftFX';
