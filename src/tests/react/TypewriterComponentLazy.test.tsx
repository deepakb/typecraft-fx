import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TypewriterComponentWithSuspense } from './../../react/TypewriterComponentLazy';
import { it, expect, describe, vi } from 'vitest';

// Mock the lazy-loaded component
const mockTypewriterComponent = vi.mock('./../../react/Typewriter', () => ({
  TypewriterComponent: () => <div data-testid="mocked-typewriter">Mocked Typewriter</div>,
}));

describe('TypewriterComponentWithSuspense', () => {
  it('renders loading state initially', async () => {
    render(<TypewriterComponentWithSuspense />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders the TypewriterComponent after lazy loading', async () => {
    render(<TypewriterComponentWithSuspense />);

    // Wait for the lazy-loaded component to appear
    const typewriter = await screen.findByTestId('mocked-typewriter');
    expect(typewriter).toBeInTheDocument();
    expect(typewriter).toHaveTextContent('Mocked Typewriter');
  });

  it('passes props to the lazy-loaded component', async () => {
    const props = { onInit: vi.fn(), options: { loop: true } };
    render(<TypewriterComponentWithSuspense {...props} />);

    // Wait for the lazy-loaded component to appear
    await screen.findByTestId('mocked-typewriter');

    // Check if props were passed correctly
    expect(vi.mocked(mockTypewriterComponent)).toHaveBeenCalledWith(props, {});
  });
});
