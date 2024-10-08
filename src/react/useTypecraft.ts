import { useState, useEffect, useRef } from 'react';
import { TypecraftEngine } from '../core/TypecraftEngine';
import { TypecraftOptions, EventCallback } from '../core/types';

export interface UseTypecraftProps {
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

  useEffect(() => {
    if (element && !TypecraftRef.current) {
      const instance = new TypecraftEngine(element, options);
      TypecraftRef.current = instance;

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
      if (onDeleteSkipped) instance.on('deleteSkipped', onDeleteSkipped);
      if (onPauseStart) instance.on('pauseStart', onPauseStart);
      if (onPauseEnd) instance.on('pauseEnd', onPauseEnd);
      if (onComplete) instance.on('complete', onComplete);
    }

    return () => {
      if (TypecraftRef.current) {
        TypecraftRef.current.stop();
        // Remove event listeners
        if (onTypeStart) TypecraftRef.current.off('typeStart', onTypeStart);
        if (onTypeChar) TypecraftRef.current.off('typeChar', onTypeChar);
        if (onTypeComplete) TypecraftRef.current.off('typeComplete', onTypeComplete);
        if (onDeleteStart) TypecraftRef.current.off('deleteStart', onDeleteStart);
        if (onDeleteChar) TypecraftRef.current.off('deleteChar', onDeleteChar);
        if (onDeleteComplete) TypecraftRef.current.off('deleteComplete', onDeleteComplete);
        if (onDeleteSkipped) TypecraftRef.current.off('deleteSkipped', onDeleteSkipped);
        if (onPauseStart) TypecraftRef.current.off('pauseStart', onPauseStart);
        if (onPauseEnd) TypecraftRef.current.off('pauseEnd', onPauseEnd);
        if (onComplete) TypecraftRef.current.off('complete', onComplete);
      }
    };
  }, [
    element,
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
  ]);

  return { setElement, typecraft: TypecraftRef.current };
}