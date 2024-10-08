import React from 'react';
import { render, act } from '@testing-library/react';
import { useTypecraft } from '../../src/react/useTypecraft';
import { TypecraftEngine } from '../../src/core/TypecraftEngine';
import { vi, expect, it, describe, beforeEach } from 'vitest';

vi.mock('../../src/core/TypecraftEngine');

// Test component that uses the hook
const TestComponent: React.FC<any> = (props) => {
  const { setElement } = useTypecraft(props);
  return <div ref={setElement} />;
};

describe('useTypecraft', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize TypecraftEngine when element is set', () => {
    render(<TestComponent />);
    expect(TypecraftEngine).toHaveBeenCalledWith(expect.any(HTMLDivElement), undefined);
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
