import React from 'react';
import { render, act } from '@testing-library/react';
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
    render(<TestComponent />);
    expect(TypecraftEngine).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      expect.objectContaining({
        autoStart: false,
        cursor: expect.any(Object),
        direction: 'ltr',
        easingFunction: expect.any(Function),
        html: false,
        loop: false,
        pauseFor: expect.any(Number),
        speed: expect.any(Number),
        strings: expect.any(Array),
        textEffect: 'none',
      })
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
