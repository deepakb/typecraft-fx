import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TypecraftComponentWithSuspense } from '../../src/react/TypecraftComponentLazy';
import { CursorStyle, Direction, TextEffect, TypecraftOptions } from '../../src';

// Mock the TypecraftComponent
vi.mock('../../src/react/TypecraftComponent', () => ({
  TypecraftComponent: () => <div data-testid="mocked-typecraft">Mocked Typecraft</div>,
}));

describe('TypecraftComponentWithSuspense', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the TypecraftComponent when loaded', async () => {
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

    render(<TypecraftComponentWithSuspense {...options} />);

    // Initially, it should show the loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for the lazy-loaded component to render
    const mockedComponent = await screen.findByTestId('mocked-typecraft');
    expect(mockedComponent).toBeInTheDocument();
    expect(mockedComponent).toHaveTextContent('Mocked Typecraft');
  });
});
