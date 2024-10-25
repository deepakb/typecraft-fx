import { render } from '@testing-library/react';
import { TypecraftFX } from '../../src/react/TypecraftFX';
import { TypecraftEngine } from '../../src/core/TypecraftEngine';
import { TypecraftOptions, Direction, CursorStyle, TextEffect } from '../../src/core/types';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock the TypecraftEngine
vi.mock('../../src/core/TypecraftEngine');

describe('TypecraftFX', () => {
  let mockTypecraft: {
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockTypecraft = {
      start: vi.fn(),
      stop: vi.fn(),
    };

    (TypecraftEngine as any) = vi.fn(() => mockTypecraft);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const options: TypecraftOptions = {
      strings: ['Test'],
      speed: { type: 50, delete: 50, delay: 1000 },
      loop: false,
      autoStart: true,
      cursor: {
        text: '|',
        color: 'black',
        blinkSpeed: 530,
        opacity: { min: 0, max: 1 },
        style: CursorStyle.Blink,
        blink: true,
      },
      pauseFor: 1500,
      direction: Direction.LTR,
      easingFunction: (t) => t,
      html: false,
      textEffect: TextEffect.None,
    };
    const { container } = render(<TypecraftFX {...options} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('initializes TypecraftEngine with correct options', () => {
    const options: TypecraftOptions = {
      strings: ['Test string'],
      speed: { type: 100, delete: 50, delay: 2000 },
      direction: Direction.RTL,
      cursor: {
        text: '_',
        color: 'red',
        opacity: { min: 0.2, max: 0.8 },
        style: CursorStyle.Blink,
        blinkSpeed: 800,
        blink: true,
      },
      pauseFor: 2000,
      loop: true,
      autoStart: true,
      easingFunction: (t) => t,
      html: false,
      textEffect: TextEffect.None,
    };

    render(<TypecraftFX {...options} />);

    expect(TypecraftEngine).toHaveBeenCalledWith(expect.any(HTMLDivElement), options);
    expect(mockTypecraft.start).toHaveBeenCalled();
  });

  it('applies className and style props', () => {
    const options: TypecraftOptions = {
      strings: ['Test'],
      speed: { type: 50, delete: 50, delay: 1000 },
      loop: false,
      autoStart: true,
      cursor: {
        text: '|',
        color: 'black',
        blinkSpeed: 530,
        opacity: { min: 0, max: 1 },
        style: CursorStyle.Blink,
        blink: true,
      },
      pauseFor: 1500,
      direction: Direction.LTR,
      easingFunction: (t) => t,
      html: false,
      textEffect: TextEffect.None,
    };

    const { container } = render(
      <TypecraftFX {...options} className="custom-class" style={{ color: 'red' }} />
    );

    const element = container.firstChild as HTMLElement;
    expect(element.className).toBe('custom-class');
    expect(element.style.color).toBe('red');
  });

  it('cleans up on unmount', () => {
    const options: TypecraftOptions = {
      strings: ['Test'],
      speed: { type: 50, delete: 50, delay: 1000 },
      loop: false,
      autoStart: true,
      cursor: {
        text: '|',
        color: 'black',
        blinkSpeed: 530,
        opacity: { min: 0, max: 1 },
        style: CursorStyle.Blink,
        blink: true,
      },
      pauseFor: 1500,
      direction: Direction.LTR,
      easingFunction: (t) => t,
      html: false,
      textEffect: TextEffect.None,
    };

    const { unmount } = render(<TypecraftFX {...options} />);

    unmount();

    expect(mockTypecraft.stop).toHaveBeenCalled();
  });

  it('does not start automatically when autoStart is false', () => {
    const options: TypecraftOptions = {
      strings: ['Test'],
      speed: { type: 50, delete: 50, delay: 1000 },
      autoStart: false,
      cursor: {
        blink: true,
        blinkSpeed: 530,
        color: 'black',
        opacity: { min: 0, max: 1 },
        style: CursorStyle.Blink,
        text: '|',
      },
      easingFunction: expect.any(Function),
      html: false,
      pauseFor: 1500,
      loop: false,
      direction: Direction.LTR,
      textEffect: TextEffect.None,
    };

    render(<TypecraftFX {...options} />);

    expect(TypecraftEngine).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      expect.objectContaining(options)
    );
    if (options.autoStart) {
      expect(mockTypecraft.start).toHaveBeenCalled();
    } else {
      expect(mockTypecraft.start).not.toHaveBeenCalled();
    }
  });
});
