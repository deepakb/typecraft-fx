import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TypecraftFXWithSuspense } from '../../src/react/TypecraftFXLazy';
import { CursorStyle, Direction, TextEffect, TypecraftOptions } from '../../src';

// Mock the TypecraftFX
vi.mock('../../src/react/TypecraftFX', () => ({
  TypecraftFX: () => <div data-testid="mocked-typecraft">Mocked Typecraft</div>,
}));

describe('TypecraftFXWithSuspense', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the TypecraftFX when loaded', async () => {
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

    render(<TypecraftFXWithSuspense {...options} />);

    // Initially, it should show the loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for the lazy-loaded component to render
    const mockedComponent = await screen.findByTestId('mocked-typecraft');
    expect(mockedComponent).toBeInTheDocument();
    expect(mockedComponent).toHaveTextContent('Mocked Typecraft');
  });
});
