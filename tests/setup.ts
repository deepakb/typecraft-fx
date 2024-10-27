import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

let currentTime = 0;

// Mock performance.now()
vi.spyOn(performance, 'now').mockImplementation(() => currentTime);

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback): number => {
  const id = setTimeout(() => {
    currentTime += 16; // Simulate ~60fps
    callback(currentTime);
  }, 0);
  return id as unknown as number;
});

// Mock cancelAnimationFrame
global.cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id);
});

// Reset the mocked time before each test
beforeEach(() => {
  currentTime = 0;
  vi.clearAllMocks();
});
