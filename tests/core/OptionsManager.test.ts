import { describe, it, expect, beforeEach } from 'vitest';
import { OptionsManager } from '../../src/core/OptionsManager';
import { TypecraftOptions, CursorStyle, Direction, TextEffect } from '../../src/core/types';

describe('OptionsManager', () => {
  let optionsManager: OptionsManager;

  beforeEach(() => {
    optionsManager = new OptionsManager();
  });

  describe('initializeOptions', () => {
    it('should initialize options with a valid string selector', () => {
      document.body.innerHTML = '<div id="test-element"></div>';
      const options: Partial<TypecraftOptions> = { strings: ['Test'] };
      const result = optionsManager.initializeOptions('#test-element', options);
      expect(result).toEqual(expect.objectContaining(options));
    });

    it('should initialize options with a valid HTMLElement', () => {
      const element = document.createElement('div');
      const options: Partial<TypecraftOptions> = { strings: ['Test'] };
      const result = optionsManager.initializeOptions(element, options);
      expect(result).toEqual(expect.objectContaining(options));
    });

    it('should throw an error for invalid string selector', () => {
      expect(() => {
        optionsManager.initializeOptions('#non-existent', {});
      }).toThrow('Element with selector "#non-existent" not found');
    });

    it('should throw an error for invalid element', () => {
      expect(() => {
        optionsManager.initializeOptions({} as HTMLElement, {});
      }).toThrow('Invalid HTML element provided');
    });
  });

  describe('validateElement', () => {
    it('should not throw an error for valid string selector', () => {
      document.body.innerHTML = '<div id="test-element"></div>';
      expect(() => {
        optionsManager.validateElement('#test-element');
      }).not.toThrow();
    });

    it('should not throw an error for valid HTMLElement', () => {
      const element = document.createElement('div');
      expect(() => {
        optionsManager.validateElement(element);
      }).not.toThrow();
    });

    it('should throw an error for invalid string selector', () => {
      expect(() => {
        optionsManager.validateElement('#non-existent');
      }).toThrow('Element with selector "#non-existent" not found');
    });

    it('should throw an error for invalid element', () => {
      expect(() => {
        optionsManager.validateElement({} as HTMLElement);
      }).toThrow('Invalid HTML element provided');
    });
  });

  describe('mergeOptions', () => {
    it('should merge options with default options', () => {
      const customOptions: Partial<TypecraftOptions> = {
        strings: ['Test'],
        speed: 100,
        loop: true,
        cursor: {
          text: '_',
          color: 'red',
          blinkSpeed: 500,
          opacity: { min: 0, max: 1 },
          style: CursorStyle.Solid,
          blink: true,
        },
      };
      const result = optionsManager.mergeOptions(customOptions);
      expect(result).toEqual(expect.objectContaining(customOptions));
      expect(result.cursor).toEqual(expect.objectContaining(customOptions.cursor));
    });

    // Add more tests for mergeOptions as needed
  });
});
