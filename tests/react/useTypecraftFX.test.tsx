import React from 'react';
import { render, act, renderHook } from '@testing-library/react';
import { useTypecraftFX } from '../../src/react/useTypecraftFX';
import { TypecraftEngine } from '../../src/core/TypecraftEngine';
import { vi, expect, it, describe, beforeEach } from 'vitest';

vi.mock('../../src/core/TypecraftEngine');

// Test component that uses the hook
const TestComponent: React.FC<any> = (props) => {
  const { setElement } = useTypecraftFX(props);
  return <div ref={setElement} />;
};

describe('useTypecraftFX', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize TypecraftEngine when element is set', () => {
    const { result } = renderHook(() => useTypecraftFX());

    const divElement = document.createElement('div');
    act(() => {
      result.current.setElement(divElement);
    });

    expect(TypecraftEngine).toHaveBeenCalledWith(
      divElement,
      expect.objectContaining({
        autoStart: false,
        cursor: expect.objectContaining({
          blink: true,
          blinkSpeed: 500,
          color: 'black',
          opacity: { min: 0, max: 1 },
          style: 'solid',
          text: '|',
        }),
        direction: 'ltr',
        html: false,
        loop: false,
        pauseFor: 1500,
        speed: {
          delay: 1500,
          delete: 50,
          type: 50,
        },
        strings: [],
        textEffect: 'none',
      }),
      expect.anything(), // logger
      expect.anything(), // errorHandler
      expect.anything() // managerFactory
    );
  });

  it('should call onInit with TypecraftEngine instance', () => {
    const onInit = vi.fn();
    render(<TestComponent onInit={onInit} />);
    expect(onInit).toHaveBeenCalledWith(expect.any(TypecraftEngine));
  });

  it('should set up event listeners', () => {
    const callbacks = {
      onTypeStart: vi.fn(),
      onTypeChar: vi.fn(),
      onTypeComplete: vi.fn(),
      onDeleteStart: vi.fn(),
      onDeleteChar: vi.fn(),
      onDeleteComplete: vi.fn(),
      onPauseStart: vi.fn(),
      onPauseEnd: vi.fn(),
      onComplete: vi.fn(),
    };

    render(<TestComponent {...callbacks} />);

    const TypecraftInstance = vi.mocked(TypecraftEngine).mock.instances[0];

    Object.keys(callbacks).forEach((callback) => {
      const eventName = callback.slice(2).charAt(0).toLowerCase() + callback.slice(3);
      expect(TypecraftInstance.on).toHaveBeenCalledWith(eventName, expect.any(Function));
    });
  });

  it('should clean up on unmount', () => {
    const { unmount } = render(<TestComponent />);
    const TypecraftInstance = vi.mocked(TypecraftEngine).mock.instances[0];

    act(() => {
      unmount();
    });

    expect(TypecraftInstance.stop).toHaveBeenCalled();
  });
});
