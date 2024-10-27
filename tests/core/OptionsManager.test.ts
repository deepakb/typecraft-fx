import { describe, it, expect, beforeEach } from 'vitest';
import { OptionsManager } from '../../src/core/managers/OptionsManager';
import { TypecraftOptions, CursorStyle, Direction, TextEffect } from '../../src/types';

describe('OptionsManager', () => {
  let optionsManager: OptionsManager;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test-element"></div>';
  });

  describe('constructor and getOptions', () => {
    it('should initialize options with a valid string selector', () => {
      const options: Partial<TypecraftOptions> = { strings: ['Test'] };
      optionsManager = new OptionsManager('#test-element', options);
      const result = optionsManager.getOptions();
      expect(result).toEqual(expect.objectContaining(options));
    });

    it('should initialize options with a valid HTMLElement', () => {
      const element = document.createElement('div');
      const options: Partial<TypecraftOptions> = { strings: ['Test'] };
      optionsManager = new OptionsManager(element, options);
      const result = optionsManager.getOptions();
      expect(result).toEqual(expect.objectContaining(options));
    });

    it('should throw an error for invalid string selector', () => {
      expect(() => {
        new OptionsManager('#non-existent', {});
      }).toThrow('Element with selector "#non-existent" not found');
    });

    it('should throw an error for invalid element', () => {
      expect(() => {
        new OptionsManager({} as HTMLElement, {});
      }).toThrow('Invalid HTML element provided');
    });
  });

  describe('getOptions', () => {
    it('should return merged options', () => {
      const customOptions: Partial<TypecraftOptions> = {
        strings: ['Test'],
        speed: { type: 100, delete: 100, delay: 1500 },
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
      optionsManager = new OptionsManager('#test-element', customOptions);
      const result = optionsManager.getOptions();
      expect(result).toEqual(expect.objectContaining(customOptions));
      expect(result.cursor).toEqual(expect.objectContaining(customOptions.cursor));
    });

    it('should include default options for unspecified properties', () => {
      optionsManager = new OptionsManager('#test-element', {});
      const result = optionsManager.getOptions();
      expect(result).toEqual(
        expect.objectContaining({
          strings: [],
          speed: { type: 50, delete: 50, delay: 1500 },
          pauseFor: 1500,
          loop: false,
          autoStart: false,
          direction: Direction.LTR,
          textEffect: TextEffect.None,
          easingFunction: expect.any(Function),
          html: true,
          cursor: expect.objectContaining({
            text: '|',
            color: 'black',
            blinkSpeed: 500,
            opacity: { min: 0, max: 1 },
            style: CursorStyle.Solid,
            blink: true,
          }),
        })
      );
    });
  });
});
