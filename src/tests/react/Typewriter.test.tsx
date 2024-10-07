import { render, screen, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TypewriterComponent } from './../../react/Typewriter';
import { Typewriter } from './../../core/Typewriter';

// Mock the core Typewriter class
vi.mock('./../../core/Typewriter', () => {
  return {
    Typewriter: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      off: vi.fn(),
      stop: vi.fn(),
    })),
  };
});

describe('TypewriterComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders without crashing', () => {
    render(<TypewriterComponent />);
    expect(screen.getByTestId('typewriter-wrapper')).toBeTruthy();
  });

  it('initializes Typewriter with options', () => {
    const options = { loop: true };
    render(<TypewriterComponent options={options} />);
    expect(Typewriter).toHaveBeenCalledWith(expect.any(HTMLDivElement), options);
  });

  it('calls onInit with Typewriter instance', () => {
    const onInit = vi.fn();
    render(<TypewriterComponent onInit={onInit} />);
    expect(onInit).toHaveBeenCalledWith(expect.any(Object));
  });

  it('sets up event listeners', () => {
    const mockTypewriter = {
      on: vi.fn(),
      off: vi.fn(),
      stop: vi.fn(),
    };
    (Typewriter as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockTypewriter);

    const props = {
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

    render(<TypewriterComponent {...props} />);

    Object.keys(props).forEach((prop) => {
      expect(mockTypewriter.on).toHaveBeenCalledWith(
        prop.slice(2).toLowerCase(),
        expect.any(Function)
      );
    });
  });

  it('cleans up on unmount', () => {
    const mockTypewriter = {
      on: vi.fn(),
      off: vi.fn(),
      stop: vi.fn(),
    };
    (Typewriter as ReturnType<typeof vi.fn>).mockImplementation(() => mockTypewriter);

    const props = {
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

    const { unmount } = render(<TypewriterComponent {...props} />);

    act(() => {
      unmount();
    });

    expect(mockTypewriter.stop).toHaveBeenCalled();
    Object.keys(props).forEach((prop) => {
      expect(mockTypewriter.off).toHaveBeenCalledWith(
        prop.slice(2).toLowerCase(),
        expect.any(Function)
      );
    });
  });

  it('does not crash when unmounting without initialization', () => {
    const { unmount } = render(<TypewriterComponent />);
    expect(() => unmount()).not.toThrow();
  });

  it('reinitializes when key props change', () => {
    const { rerender } = render(<TypewriterComponent options={{ loop: true }} />);
    expect(Typewriter).toHaveBeenCalledTimes(1);

    rerender(<TypewriterComponent options={{ loop: false }} />);
    expect(Typewriter).toHaveBeenCalledTimes(2);
  });
});
