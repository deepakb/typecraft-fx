import { useEffect, useRef, FC } from 'react';
import { Typewriter } from '../core/Typewriter';
import {
  TypewriterOptions,
  Direction,
  CursorStyle,
  TextEffect,
  EventCallback,
} from '../core/types';

export interface TypewriterComponentProps {
  onInit?: (typewriter: Typewriter) => void;
  options?: Partial<TypewriterOptions>;
  onTypeStart?: EventCallback;
  onTypeChar?: EventCallback;
  onTypeComplete?: EventCallback;
  onDeleteStart?: EventCallback;
  onDeleteChar?: EventCallback;
  onDeleteComplete?: EventCallback;
  onPauseStart?: EventCallback;
  onPauseEnd?: EventCallback;
  onComplete?: EventCallback;
}

export const TypewriterComponent: FC<TypewriterComponentProps> = ({
  onInit,
  options,
  onTypeStart,
  onTypeChar,
  onTypeComplete,
  onDeleteStart,
  onDeleteChar,
  onDeleteComplete,
  onPauseStart,
  onPauseEnd,
  onComplete,
}) => {
  const typewriterRef = useRef<HTMLDivElement>(null);
  const typewriterInstanceRef = useRef<Typewriter | null>(null);

  useEffect(() => {
    if (typewriterRef.current && !typewriterInstanceRef.current) {
      const instance = new Typewriter(typewriterRef.current, options);
      typewriterInstanceRef.current = instance;

      if (onInit) {
        onInit(instance);
      }

      // Set up event listeners
      if (onTypeStart) instance.on('typeStart', onTypeStart);
      if (onTypeChar) instance.on('typeChar', onTypeChar);
      if (onTypeComplete) instance.on('typeComplete', onTypeComplete);
      if (onDeleteStart) instance.on('deleteStart', onDeleteStart);
      if (onDeleteChar) instance.on('deleteChar', onDeleteChar);
      if (onDeleteComplete) instance.on('deleteComplete', onDeleteComplete);
      if (onPauseStart) instance.on('pauseStart', onPauseStart);
      if (onPauseEnd) instance.on('pauseEnd', onPauseEnd);
      if (onComplete) instance.on('complete', onComplete);
    }

    return () => {
      if (typewriterInstanceRef.current) {
        typewriterInstanceRef.current.stop();
        // Remove event listeners
        if (onTypeStart) typewriterInstanceRef.current.off('typeStart', onTypeStart);
        if (onTypeChar) typewriterInstanceRef.current.off('typeChar', onTypeChar);
        if (onTypeComplete) typewriterInstanceRef.current.off('typeComplete', onTypeComplete);
        if (onDeleteStart) typewriterInstanceRef.current.off('deleteStart', onDeleteStart);
        if (onDeleteChar) typewriterInstanceRef.current.off('deleteChar', onDeleteChar);
        if (onDeleteComplete) typewriterInstanceRef.current.off('deleteComplete', onDeleteComplete);
        if (onPauseStart) typewriterInstanceRef.current.off('pauseStart', onPauseStart);
        if (onPauseEnd) typewriterInstanceRef.current.off('pauseEnd', onPauseEnd);
        if (onComplete) typewriterInstanceRef.current.off('complete', onComplete);
      }
    };
  }, [
    onInit,
    options,
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

  return <div ref={typewriterRef} className="typewriter-wrapper" />;
};

export { Direction, CursorStyle, TextEffect };
