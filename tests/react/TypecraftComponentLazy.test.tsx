import { Suspense } from 'react';
import { render, screen, act } from '@testing-library/react';
import { TypecraftComponentWithSuspense } from '../../src/react/TypecraftComponentLazy';
import { vi, expect, it, describe } from 'vitest';

// Create a promise to control when the lazy component resolves
const lazyComponentPromise = new Promise<void>((resolve) => {
  resolveComponent = resolve;
});
let resolveComponent: () => void;

// Mock the lazy-loaded component
const MockedTypecraftComponent = vi.fn(() => (
  <div data-testid="mocked-typecraft">Mocked Typecraft</div>
));

vi.mock('../../src/react/TypecraftComponent', () => ({
  TypecraftComponent: MockedTypecraftComponent,
}));

// Mock the lazy function
vi.mock('react', async () => {
  const actual = (await vi.importActual('react')) as typeof import('react');
  return {
    ...actual,
    lazy: () => lazyComponentPromise.then(() => ({ default: MockedTypecraftComponent })),
  };
});

describe('TypecraftComponentWithSuspense', () => {
  it('renders loading state initially and then the component', async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <TypecraftComponentWithSuspense />
      </Suspense>
    );

    // Check for loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Resolve the lazy component
    await act(async () => {
      resolveComponent();
      await lazyComponentPromise;
    });

    // Check for the loaded component
    expect(screen.getByTestId('mocked-typecraft')).toBeInTheDocument();
    expect(screen.getByText('Mocked Typecraft')).toBeInTheDocument();
  });

  it('passes props to the lazy-loaded component', async () => {
    const props = {
      options: { strings: ['Hello', 'World'] },
      onInit: vi.fn(),
    };

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <TypecraftComponentWithSuspense {...props} />
      </Suspense>
    );

    // Resolve the lazy component
    await act(async () => {
      resolveComponent();
      await lazyComponentPromise;
    });

    expect(MockedTypecraftComponent).toHaveBeenCalledWith(props, {});
  });
});
