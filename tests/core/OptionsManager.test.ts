import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OptionsManager } from '../../src/core/managers/OptionsManager';
import { TypecraftOptions, CursorStyle } from '../../src/types';

describe('OptionsManager', () => {
  let optionsManager: OptionsManager;
  let mockLogger: any;
  let mockErrorHandler: any;

  beforeEach(() => {
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    mockErrorHandler = {
      handleError: vi.fn().mockImplementation((error, message) => {
        throw new Error(message || error.message);
      }),
    };
    document.body.innerHTML = '<div id="test-element"></div>';
  });

  describe('constructor and getOptions', () => {
    it('should initialize options with a valid string selector', () => {
      optionsManager = new OptionsManager('#test-element', {}, mockLogger, mockErrorHandler);
      expect(optionsManager.getOptions()).toBeDefined();
    });

    it('should initialize options with a valid HTMLElement', () => {
      const element = document.getElementById('test-element') as HTMLElement;
      optionsManager = new OptionsManager(element, {}, mockLogger, mockErrorHandler);
      expect(optionsManager.getOptions()).toBeDefined();
    });

    it('should throw an error for invalid string selector', () => {
      expect(() => {
        new OptionsManager('#non-existent', {}, mockLogger, mockErrorHandler);
      }).toThrow('Element with selector "#non-existent" not found');
    });

    it('should throw an error for invalid element', () => {
      expect(() => {
        new OptionsManager({} as HTMLElement, {}, mockLogger, mockErrorHandler);
      }).toThrow('Invalid HTML element provided');
    });
  });

  describe('getOptions', () => {
    it('should return merged options', () => {
      const options: Partial<TypecraftOptions> = {
        speed: { type: 100, delete: 50, delay: 1000 },
      };
      optionsManager = new OptionsManager('#test-element', options, mockLogger, mockErrorHandler);
      expect(optionsManager.getOptions().speed.type).toBe(100);
    });

    it('should include default options for unspecified properties', () => {
      optionsManager = new OptionsManager('#test-element', {}, mockLogger, mockErrorHandler);
      const options = optionsManager.getOptions();

      expect(options).toMatchObject({
        easingFunction: expect.any(Function),
        html: false,
        cursor: {
          text: '|',
          color: 'black',
          blinkSpeed: 500,
          opacity: { min: 0, max: 1 },
          style: CursorStyle.Solid,
          blink: true,
        },
      });
    });
  });
});
