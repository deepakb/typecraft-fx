import { TypecraftEngine } from '../../src/core/TypecraftEngine';
import {
  TypecraftOptions,
  CursorStyle,
  Direction,
  TextEffect,
  QueueActionType,
  NodeType,
} from '../../src/core/types';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the managers
vi.mock('../../src/core/CursorManager');
vi.mock('../../src/core/QueueManager');
vi.mock('../../src/core/TextEffectManager');

describe('TypecraftEngine', () => {
  let engine: TypecraftEngine;
  let element: HTMLElement;
  let options: Partial<TypecraftOptions>;

  beforeEach(() => {
    element = document.createElement('div');
    options = {};
    document.body.appendChild(element);
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with default options', () => {
      engine = new TypecraftEngine(element);
      expect(engine).toBeDefined();
    });

    it('should initialize with custom options', () => {
      options = {
        strings: ['Hello, World!'],
        speed: 100,
        loop: true,
      };
      engine = new TypecraftEngine(element, options);
      expect(engine).toBeDefined();
    });

    it('should throw an error for invalid string selector', () => {
      expect(() => new TypecraftEngine('#non-existent')).toThrow();
    });

    it('should throw an error for invalid element', () => {
      expect(() => new TypecraftEngine({} as HTMLElement)).toThrow();
    });
  });

  describe('Public Methods', () => {
    beforeEach(() => {
      engine = new TypecraftEngine(element);
    });

    it('should set easing function', () => {
      const easingFn = (t: number) => t * t;
      engine.setEasingFunction(easingFn);
      expect(engine['options'].easingFunction).toBe(easingFn);
    });

    it('should change easing function', () => {
      const easingFn = (t: number) => t * t;
      engine.changeEasingFunction(easingFn);
      expect(engine['options'].easingFunction).toBe(easingFn);
    });

    it('should set direction', () => {
      engine.setDirection(Direction.RTL);
      expect(engine['options'].direction).toBe(Direction.RTL);
      expect(element.style.direction).toBe('rtl');
    });

    it('should change speed', () => {
      engine.changeSpeed(200);
      expect(engine['options'].speed).toBe(200);
    });

    it('should change cursor', () => {
      engine.changeCursor('_');
      expect(engine['options'].cursor.text).toBe('_');
    });

    it('should change type speed', () => {
      engine.changeTypeSpeed(150);
      expect(engine['options'].speed).toEqual({ type: 150, delete: 150, delay: 1500 });
    });

    it('should change delete speed', () => {
      engine.changeDeleteSpeed(75);
      expect(engine['options'].speed).toEqual({ type: 75, delete: 75, delay: 1500 });
    });

    it('should change delay speed', () => {
      engine.changeDelaySpeed(2000);
      expect(engine['options'].speed).toEqual({ type: 50, delete: 50, delay: 2000 });
    });

    it('should type string', () => {
      const addToQueueSpy = vi.spyOn(engine['queueManager'], 'add');
      engine.typeString('Hello');
      expect(addToQueueSpy).toHaveBeenCalledTimes(5);
    });

    it('should delete chars', () => {
      const addToQueueSpy = vi.spyOn(engine['queueManager'], 'add');
      engine.deleteChars(3);
      expect(addToQueueSpy).toHaveBeenCalledTimes(3);
    });

    it('should delete all', () => {
      engine['state'].visibleNodes = [
        { type: NodeType.Character, node: document.createElement('span') },
        { type: NodeType.Character, node: document.createElement('span') },
      ];
      const deleteCharsSpy = vi.spyOn(engine, 'deleteChars');
      engine.deleteAll();
      expect(deleteCharsSpy).toHaveBeenCalledWith(2);
    });

    it('should pause for specified time', () => {
      const addToQueueSpy = vi.spyOn(engine['queueManager'], 'add');
      engine.pauseFor(1000);
      expect(addToQueueSpy).toHaveBeenCalledWith({
        type: QueueActionType.PAUSE,
        payload: { ms: 1000 },
      });
    });

    it('should change cursor style', () => {
      const changeCursorStyleSpy = vi.spyOn(engine['cursorManager'], 'changeCursorStyle');
      engine.changeCursorStyle(CursorStyle.Blink);
      expect(changeCursorStyleSpy).toHaveBeenCalledWith(CursorStyle.Blink);
    });

    it('should change text effect', () => {
      engine.changeTextEffect(TextEffect.FadeIn);
      expect(engine['options'].textEffect).toBe(TextEffect.FadeIn);
    });

    it('should start typing', async () => {
      const runQueueSpy = vi.spyOn(engine as any, 'runQueue').mockResolvedValue(undefined);
      await engine.start();
      expect(runQueueSpy).toHaveBeenCalled();
    });

    it('should stop typing', () => {
      engine['rafId'] = 1;
      const clearSpy = vi.spyOn(engine['queueManager'], 'clear');
      engine.stop();
      expect(clearSpy).toHaveBeenCalled();
    });

    it('should add event listener', () => {
      const callback = vi.fn();
      engine.on('typeChar', callback);
      expect(engine['state'].eventListeners.get('typeChar')).toContain(callback);
    });

    it('should remove event listener', () => {
      const callback = vi.fn();
      engine.on('typeChar', callback);
      engine.off('typeChar', callback);
      expect(engine['state'].eventListeners.get('typeChar')).not.toContain(callback);
    });

    it('should call function', () => {
      const callback = vi.fn();
      const addToQueueSpy = vi.spyOn(engine['queueManager'], 'add');
      engine.callFunction(callback);
      expect(addToQueueSpy).toHaveBeenCalledWith({
        type: QueueActionType.CALL_FUNCTION,
        payload: { callback },
      });
    });

    it('should type out all strings', () => {
      engine['options'].strings = ['Hello', 'World'];
      const typeStringSpy = vi.spyOn(engine, 'typeString');
      const pauseForSpy = vi.spyOn(engine, 'pauseFor');
      const deleteAllSpy = vi.spyOn(engine, 'deleteAll');
      engine.typeOutAllStrings();
      expect(typeStringSpy).toHaveBeenCalledTimes(2);
      expect(pauseForSpy).toHaveBeenCalledTimes(1);
      expect(deleteAllSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Private Methods', () => {
    beforeEach(() => {
      engine = new TypecraftEngine(element);
    });

    it('should emit events', () => {
      const callback = vi.fn();
      engine['state'].eventListeners.set('typeChar', [callback]);
      engine['emit']('typeChar', { char: 'a' });
      expect(callback).toHaveBeenCalledWith({ char: 'a' });
    });

    it('should run queue', async () => {
      const queueItem = { type: QueueActionType.TYPE_CHARACTER, payload: { char: 'a' } };
      vi.spyOn(engine['queueManager'], 'getNext').mockReturnValueOnce(queueItem);
      const typeCharacterSpy = vi
        .spyOn(engine as any, 'typeCharacter')
        .mockResolvedValue(undefined);
      await engine['runQueue']();
      expect(typeCharacterSpy).toHaveBeenCalledWith({ char: 'a' });
    });

    it('should check operation complete', () => {
      const emitSpy = vi.spyOn(engine as any, 'emit');
      engine['state'].lastOperation = QueueActionType.TYPE_CHARACTER;
      engine['checkOperationComplete']();
      expect(emitSpy).toHaveBeenCalledWith('typeComplete');
      expect(emitSpy).toHaveBeenCalledWith('complete');
    });

    it('should parse node', () => {
      const node = document.createElement('div');
      node.innerHTML = 'Hello <strong>World</strong>';
      const result = engine['parseNode'](node);
      expect(result).toHaveLength(4);
    });

    it('should type character', async () => {
      const engine = new TypecraftEngine(element);
      const typeCharSpy = vi.spyOn(engine as any, 'typeCharacter');

      (engine as any).typeCharacter({ char: 'A' });

      vi.advanceTimersByTime(50);
      await vi.runAllTimersAsync();

      expect(typeCharSpy).toHaveBeenCalledWith({ char: 'A' });
      expect(element.textContent).toBe('A');
    });

    it('should delete character', async () => {
      engine['state'].visibleNodes = [
        { type: NodeType.Character, node: document.createElement('span') },
      ];
      const waitSpy = vi.spyOn(engine as any, 'wait').mockResolvedValue(undefined);
      await engine['deleteCharacter']();
      expect(engine['state'].visibleNodes).toHaveLength(0);
      expect(waitSpy).toHaveBeenCalled();
    });

    it('should get type speed', () => {
      expect(engine['getTypeSpeed']()).toBe(50);
    });

    it('should animate cursor', () => {
      engine['state'].cursorNode = document.createElement('span');
      engine['animateCursor']();
      expect(engine['rafId']).toBeDefined();
    });

    it('should apply text effect', async () => {
      const element = document.createElement('div');
      const engine = new TypecraftEngine(element, { textEffect: TextEffect.FadeIn });
      const applyTextEffectSpy = vi
        .spyOn(engine['textEffectManager'], 'applyTextEffect')
        .mockImplementation(async () => {
          // Mock the implementation to resolve immediately
          await Promise.resolve();
        });

      // Add some visible nodes
      engine['state'].visibleNodes = [
        { type: NodeType.Character, node: document.createElement('span') },
        { type: NodeType.Character, node: document.createElement('span') },
      ];

      const applyTextEffectPromise = engine['applyTextEffect'](TextEffect.FadeIn);

      // Run all timers and micro-tasks
      await vi.runAllTimersAsync();
      await vi.runAllTicks();

      await applyTextEffectPromise;

      expect(applyTextEffectSpy).toHaveBeenCalledTimes(2);
      expect(applyTextEffectSpy).toHaveBeenCalledWith(
        TextEffect.FadeIn,
        expect.any(HTMLElement),
        expect.any(Number),
        expect.any(Function)
      );
    });

    it('should wait for specified time', async () => {
      vi.useFakeTimers();
      const engine = new TypecraftEngine(element);
      const pauseTime = 1000;

      const promise = engine.pauseFor(pauseTime).start();

      vi.advanceTimersByTime(pauseTime);
      await promise;

      expect(vi.getTimerCount()).toBe(0);
      vi.useRealTimers();
    });
  });
});
