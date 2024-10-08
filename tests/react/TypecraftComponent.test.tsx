import React from 'react';
import { render } from '@testing-library/react';
import { TypecraftComponent } from '../../src/react/TypecraftComponent';
import { TypecraftEngine } from '../../src/core/TypecraftEngine';
import { TypecraftOptions, Direction, CursorStyle, TextEffect } from '../../src/core/types';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock the TypecraftEngine
vi.mock('../../src/core/TypecraftEngine');

describe('TypecraftComponent', () => {
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
        cursorStyle: CursorStyle.Blink,
      },
      pauseFor: 1500,
      direction: Direction.LTR,
      cursorStyle: CursorStyle.Solid,
      cursorCharacter: '|',
      cursorBlink: true,
      easingFunction: (t) => t,
      html: false,
      textEffect: TextEffect.None,
    };
    const { container } = render(<TypecraftComponent {...options} />);
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
        cursorStyle: CursorStyle.Blink,
        blinkSpeed: 800,
      },
      pauseFor: 2000,
      loop: true,
      autoStart: false,
      cursorStyle: CursorStyle.Solid,
      cursorCharacter: '_',
      cursorBlink: false,
      easingFunction: (t) => t,
      html: false,
      textEffect: TextEffect.None,
    };

    render(<TypecraftComponent {...options} />);

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
        cursorStyle: CursorStyle.Blink,
      },
      pauseFor: 1500,
      direction: Direction.LTR,
      cursorStyle: CursorStyle.Solid,
      cursorCharacter: '|',
      cursorBlink: true,
      easingFunction: (t) => t,
      html: false,
      textEffect: TextEffect.None,
    };

    const { container } = render(
      <TypecraftComponent {...options} className="custom-class" style={{ color: 'red' }} />
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
        cursorStyle: CursorStyle.Blink,
      },
      pauseFor: 1500,
      direction: Direction.LTR,
      cursorStyle: CursorStyle.Solid,
      cursorCharacter: '|',
      cursorBlink: true,
      easingFunction: (t) => t,
      html: false,
      textEffect: TextEffect.None,
    };

    const { unmount } = render(<TypecraftComponent {...options} />);

    unmount();

    expect(mockTypecraft.stop).toHaveBeenCalled();
  });
});
