import { TypecraftEngine } from '../../src/core/TypecraftEngine';
import {
  TypecraftOptions,
  Direction,
  TextEffect,
  QueueActionType,
  EasingFunction,
  CursorStyle,
} from '../../src/types';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the managers
vi.mock('../../src/core/CursorManager');
vi.mock('../../src/core/QueueManager');
vi.mock('../../src/core/EffectsManager');
vi.mock('../../src/core/StringManager');
vi.mock('../../src/core/SpeedManager');
vi.mock('../../src/core/EasingManager');

describe('TypecraftEngine', () => {
  let engine: TypecraftEngine;
  let element: HTMLElement;
  let options: Partial<TypecraftOptions>;

  beforeEach(() => {
    element = document.createElement('div');
    options = {
      strings: ['Hello, World!'],
      cursor: {
        text: '|',
        color: 'black',
        blinkSpeed: 500,
        opacity: { min: 0, max: 1 },
        style: CursorStyle.Solid,
        blink: true,
      },
    };
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
      const element = document.createElement('div');
      const engine = new TypecraftEngine(element);

      expect(engine).toBeDefined();
      expect(engine.getElement()).toBe(element);
    });

    it('should initialize with custom options', () => {
      options = {
        strings: ['Hello, World!'],
        speed: { delay: 1000, type: 100, delete: 100 },
        loop: true,
        cursor: {
          text: '_',
          color: 'red',
          blinkSpeed: 800,
          opacity: { min: 0.2, max: 0.8 },
          style: CursorStyle.Blink,
          blink: true,
        },
      };
      engine = new TypecraftEngine(element, options);
      expect(engine).toBeDefined();
    });

    it('should call init method', () => {
      const initSpy = vi.spyOn(TypecraftEngine.prototype as any, 'init');
      engine = new TypecraftEngine(element, options);
      expect(initSpy).toHaveBeenCalled();
    });
  });

  describe('Public Methods', () => {
    beforeEach(() => {
      element = document.createElement('div');
      engine = new TypecraftEngine(element);
    });

    it('should set easing function', () => {
      const easingFn: EasingFunction = (t: number) => t * t;
      const setEasingFunctionSpy = vi.spyOn(engine['easingManager'], 'setEasingFunction');
      engine.setEasingFunction(easingFn);
      expect(setEasingFunctionSpy).toHaveBeenCalledWith(easingFn);
    });

    it('should set direction', () => {
      const setDirectionSpy = vi.spyOn(engine['stateManager'], 'getState');
      engine.setDirection(Direction.RTL);
      expect(engine['options'].direction).toBe(Direction.RTL);
      expect(setDirectionSpy).toHaveBeenCalled();
    });

    it('should set speed', () => {
      const setSpeedSpy = vi.spyOn(engine['speedManager'], 'setSpeed');
      engine.setSpeed({ type: 200 });
      expect(setSpeedSpy).toHaveBeenCalledWith({ type: 200 });
    });

    it('should change cursor', () => {
      engine.changeCursor({ text: '_' });
      expect(engine['options'].cursor.text).toBe('_');
    });

    it('should set type speed', () => {
      const setTypeSpeedSpy = vi.spyOn(engine['speedManager'], 'setSpeed');
      engine.setSpeed({ type: 150 });
      expect(setTypeSpeedSpy).toHaveBeenCalledWith({ type: 150 });
    });

    it('should set delete speed', () => {
      const setDeleteSpeedSpy = vi.spyOn(engine['speedManager'], 'setSpeed');
      engine.setSpeed({ delete: 75 });
      expect(setDeleteSpeedSpy).toHaveBeenCalledWith({ delete: 75 });
    });

    it('should set delay speed', () => {
      const setDelaySpeedSpy = vi.spyOn(engine['speedManager'], 'setSpeed');
      engine.setSpeed({ delay: 2000 });
      expect(setDelaySpeedSpy).toHaveBeenCalledWith({ delay: 2000 });
    });

    it('should pause for specified time', () => {
      const addToQueueSpy = vi.spyOn(engine['queueManager'], 'add');
      engine.pauseFor(1000);
      expect(addToQueueSpy).toHaveBeenCalledWith({
        type: QueueActionType.PAUSE,
        payload: { ms: 1000 },
      });
    });

    it('should set text effect', () => {
      engine.setTextEffect(TextEffect.FadeIn);
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
      const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');
      engine.stop();
      expect(clearSpy).toHaveBeenCalled();
      expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(1);
    });

    it('should add event listener', () => {
      const callback = vi.fn();
      const addEventListenerSpy = vi.spyOn(engine['stateManager'], 'addEventListener');
      engine.on('typeChar', callback);
      expect(addEventListenerSpy).toHaveBeenCalledWith('typeChar', callback);
    });

    it('should remove event listener', () => {
      const callback = vi.fn();
      const removeEventListenerSpy = vi.spyOn(engine['stateManager'], 'removeEventListener');
      engine.off('typeChar', callback);
      expect(removeEventListenerSpy).toHaveBeenCalledWith('typeChar', callback);
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
      const typeStringSpy = vi.spyOn(engine['stringManager'], 'typeString');
      const deleteAllSpy = vi.spyOn(engine['stringManager'], 'deleteAll');
      engine.typeAllStrings();
      expect(typeStringSpy).toHaveBeenCalledTimes(2);
      expect(deleteAllSpy).toHaveBeenCalledTimes(1);
    });

    it('should register custom effect', () => {
      const customEffect = vi.fn();
      const registerCustomEffectSpy = vi.spyOn(engine['EffectManager'], 'registerCustomEffect');
      engine.registerCustomEffect('customEffect', customEffect);
      expect(registerCustomEffectSpy).toHaveBeenCalledWith('customEffect', customEffect);
    });

    it('should get element', () => {
      const getStateSpy = vi.spyOn(engine['stateManager'], 'getState').mockReturnValue({
        element: element,
      } as any);
      const result = engine.getElement();
      expect(getStateSpy).toHaveBeenCalled();
      expect(result).toBe(element);
    });
  });

  describe('Private Methods', () => {
    beforeEach(() => {
      element = document.createElement('div');
      engine = new TypecraftEngine(element);
    });

    it('should emit events', () => {
      const callback = vi.fn();
      const getEventListenersSpy = vi
        .spyOn(engine['stateManager'], 'getEventListeners')
        .mockReturnValue([callback]);
      (engine as any).emit('typeChar', { char: 'a' });
      expect(getEventListenersSpy).toHaveBeenCalledWith('typeChar');
      expect(callback).toHaveBeenCalledWith({ char: 'a' });
    });

    it('should run queue', async () => {
      const queueItem = { type: QueueActionType.TYPE_CHARACTER, payload: { char: 'a' } };
      vi.spyOn(engine['queueManager'], 'getNext').mockReturnValueOnce(queueItem);
      const typeCharacterSpy = vi
        .spyOn(engine as any, 'typeCharacter')
        .mockResolvedValue(undefined);
      await (engine as any).runQueue();
      expect(typeCharacterSpy).toHaveBeenCalledWith({ char: 'a' });
    });

    it('should check operation complete', () => {
      const emitSpy = vi.spyOn(engine as any, 'emit');
      const getStateSpy = vi.spyOn(engine['stateManager'], 'getState').mockReturnValue({
        queue: [],
        lastOperation: QueueActionType.TYPE_CHARACTER,
      } as any);
      (engine as any).checkOperationComplete();
      expect(getStateSpy).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith('typeComplete');
      expect(emitSpy).toHaveBeenCalledWith('complete');
    });

    it('should type character', async () => {
      const testElement = document.createElement('div');
      document.body.appendChild(testElement);

      const engine = new TypecraftEngine(testElement, {
        strings: ['Test'],
        speed: { type: 50, delete: 50, delay: 0 },
        loop: false,
        autoStart: false,
        textEffect: TextEffect.None, // Disable text effects for this test
      });

      // Mock methods to avoid side effects
      vi.spyOn(engine['cursorManager'], 'updateCursorPosition').mockImplementation(() => {});
      vi.spyOn(engine as any, 'applyTextEffect').mockResolvedValue(undefined);
      vi.spyOn(engine as any, 'emit').mockImplementation(() => {});

      // Use fake timers
      vi.useFakeTimers();

      const typePromise = (engine as any).typeCharacter({ char: 'A' });

      // Fast-forward time
      vi.advanceTimersByTime(50);

      await typePromise;

      expect(testElement.textContent).toBe('A');

      // Clean up
      document.body.removeChild(testElement);
      vi.useRealTimers();
    });

    it('should delete character', async () => {
      const engine = new TypecraftEngine(element, {});
      element.textContent = 'Test'; // Add this line to ensure there's content to delete
      await engine['deleteChars'](1);
      expect(element.textContent).toBe('Tes');
    });

    // it('should apply text effect', async () => {
    //   const getStateSpy = vi.spyOn(engine['stateManager'], 'getState').mockReturnValue({
    //     visibleNodes: [
    //       { type: NodeType.Character, node: document.createElement('span') },
    //       { type: NodeType.Character, node: document.createElement('span') },
    //     ],
    //   } as any);
    //   const applyTextEffectSpy = vi
    //     .spyOn(engine['EffectManager'], 'applyTextEffect')
    //     .mockResolvedValue(undefined);
    //   const resetEffectStylesSpy = vi.spyOn(engine['EffectManager'], 'resetEffectStyles');

    //   await (engine as any).applyTextEffect(TextEffect.FadeIn);

    //   expect(getStateSpy).toHaveBeenCalled();
    //   expect(applyTextEffectSpy).toHaveBeenCalledTimes(2);
    //   expect(resetEffectStylesSpy).toHaveBeenCalled();
    // });

    // it('should wait for specified time', async () => {
    //   vi.useFakeTimers();
    //   const emitSpy = vi.spyOn(engine as any, 'emit');

    //   const waitPromise = (engine as any).wait(1000);

    //   vi.advanceTimersByTime(1000);
    //   await waitPromise;

    //   expect(emitSpy).toHaveBeenCalledWith('pauseEnd');
    //   vi.useRealTimers();
    // });

    // it('should type HTML tag open', async () => {
    //   const getStateSpy = vi.spyOn(engine['stateManager'], 'getState').mockReturnValue({
    //     element: element,
    //   } as any);
    //   const updateVisibleNodesSpy = vi.spyOn(engine['stateManager'], 'updateVisibleNodes');
    //   const updateCursorPositionSpy = vi.spyOn(engine['cursorManager'], 'updateCursorPosition');
    //   const waitSpy = vi.spyOn(engine as any, 'wait').mockResolvedValue(undefined);

    //   await (engine as any).typeHtmlTagOpen({
    //     tagName: 'div',
    //     attributes: {},
    //   });

    //   expect(getStateSpy).toHaveBeenCalled();
    //   expect(updateVisibleNodesSpy).toHaveBeenCalled();
    //   expect(updateCursorPositionSpy).toHaveBeenCalled();
    //   expect(waitSpy).toHaveBeenCalled();
    //   expect(element.children.length).toBe(1);
    //   expect(element.children[0].tagName).toBe('DIV');
    // });

    // it('should type HTML tag close', async () => {
    //   const state = engine['stateManager'].getState();
    //   const div = document.createElement('div');
    //   state.element.appendChild(div);
    //   state.visibleNodes.push({ type: NodeType.HTMLElement, node: div });

    //   const updateCursorPositionSpy = vi.spyOn(engine['cursorManager'], 'updateCursorPosition');
    //   const waitSpy = vi.spyOn(engine as any, 'wait').mockResolvedValue(undefined);

    //   await (engine as any).typeHtmlTagClose({ tagName: 'div' });

    //   expect(updateCursorPositionSpy).toHaveBeenCalled();
    //   expect(waitSpy).toHaveBeenCalled();
    //   expect(state.element.innerHTML).toBe('<div></div>');
    // });

    // it('should type HTML content', async () => {
    //   const state = engine['stateManager'].getState();
    //   const div = document.createElement('div');
    //   state.element.appendChild(div);
    //   state.visibleNodes.push({ type: NodeType.HTMLElement, node: div });

    //   const updateCursorPositionSpy = vi.spyOn(engine['cursorManager'], 'updateCursorPosition');
    //   const waitSpy = vi.spyOn(engine as any, 'wait').mockResolvedValue(undefined);

    //   await (engine as any).typeHtmlContent('Hello');

    //   expect(updateCursorPositionSpy).toHaveBeenCalled();
    //   expect(waitSpy).toHaveBeenCalled();
    //   expect(state.element.innerHTML).toBe('<div>Hello</div>');
    // });

    // it('should handle loop correctly', async () => {
    //   // Set up the loop option
    //   engine['options'].loop = true;

    //   // Spy on the typeAllStrings method
    //   const typeAllStringsSpy = vi.spyOn(engine, 'typeAllStrings');

    //   // Mock the queueManager to return null (empty queue) only once, then a dummy item
    //   vi.spyOn(engine['queueManager'], 'getNext')
    //     .mockReturnValueOnce(undefined)
    //     .mockReturnValueOnce({ type: QueueActionType.PAUSE, payload: { ms: 0 } });

    //   // Use fake timers
    //   vi.useFakeTimers();

    //   // Call the private method that handles the loop
    //   const runQueuePromise = (engine as any).runQueue();

    //   // Fast-forward time
    //   vi.advanceTimersByTime(50);

    //   // Wait for the runQueue promise to resolve
    //   await runQueuePromise;

    //   // Check if typeAllStrings was called
    //   expect(typeAllStringsSpy).toHaveBeenCalled();

    //   // Check if getNext was called once
    //   expect(engine['queueManager'].getNext).toHaveBeenCalledTimes(1);

    //   // Restore real timers
    //   vi.useRealTimers();
    // });

    // // it('should execute callback function correctly', async () => {
    // //   // Create a mock callback function
    // //   const mockCallback = vi.fn();

    // //   console.log('Queue before:', engine['getQueue']());

    // //   // Add the callback to the queue
    // //   engine.callFunction(mockCallback);

    // //   console.log('Queue after:', engine['getQueue']());

    // //   // Spy on the runQueue method
    // //   const runQueueSpy = vi.spyOn(engine as any, 'runQueue');

    // //   // Manually trigger queue processing
    // //   await (engine as any).runQueue();

    // //   // Wait for the queue to be processed
    // //   await new Promise<void>((resolve) => {
    // //     const checkQueue = () => {
    // //       const queue = engine['getQueue']();
    // //       if (queue.length === 0) {
    // //         resolve();
    // //       } else {
    // //         setTimeout(checkQueue, 10);
    // //       }
    // //     };
    // //     checkQueue();
    // //   });

    // //   console.log('runQueue called:', runQueueSpy.mock.calls.length, 'times');

    // //   // Check if runQueue was called
    // //   expect(runQueueSpy).toHaveBeenCalled();

    // //   // Check if the callback was executed
    // //   expect(mockCallback).toHaveBeenCalled();
    // // }, 10000);

    // it('should change direction', () => {
    //   (engine as any).setDirection(Direction.RTL);
    //   expect(engine['options'].direction).toBe(Direction.RTL);
    // });

    // it('should change cursor properties', () => {
    //   const changeCursorStyleSpy = vi.spyOn(engine['cursorManager'], 'changeCursorStyle');
    //   const startBlinkingSpy = vi.spyOn(engine['cursorManager'], 'startBlinking');
    //   const stopBlinkingSpy = vi.spyOn(engine['cursorManager'], 'stopBlinking');
    //   const changeBlinkSpeedSpy = vi.spyOn(engine['cursorManager'], 'changeBlinkSpeed');
    //   const changeOpacitySpy = vi.spyOn(engine['cursorManager'], 'changeOpacity');

    //   engine.changeCursor({
    //     text: '_',
    //     color: 'red',
    //     style: CursorStyle.Blink,
    //     blink: true,
    //     blinkSpeed: 600,
    //     opacity: { min: 0.2, max: 0.8 },
    //   });

    //   expect(engine['options'].cursor.text).toBe('_');
    //   expect(engine['options'].cursor.color).toBe('red');
    //   expect(engine['options'].cursor.style).toBe(CursorStyle.Blink);
    //   expect(engine['options'].cursor.blink).toBe(true);
    //   expect(engine['options'].cursor.blinkSpeed).toBe(600);
    //   expect(engine['options'].cursor.opacity).toEqual({ min: 0.2, max: 0.8 });

    //   expect(changeCursorStyleSpy).toHaveBeenCalledWith(CursorStyle.Blink);
    //   expect(startBlinkingSpy).toHaveBeenCalled();
    //   expect(changeBlinkSpeedSpy).toHaveBeenCalledWith(600);
    //   expect(changeOpacitySpy).toHaveBeenCalledWith({ min: 0.2, max: 0.8 });

    //   // Reset the spies
    //   vi.clearAllMocks();

    //   engine.changeCursor({ blink: false });
    //   expect(stopBlinkingSpy).toHaveBeenCalled();
    // });

    // it('should change text effect', () => {
    //   (engine as any).setTextEffect(TextEffect.FadeIn);
    //   expect(engine['options'].textEffect).toBe(TextEffect.FadeIn);
    // });

    // it('should parse node', () => {
    //   const testNode = document.createElement('div');
    //   testNode.innerHTML = '<p>Hello <strong>World</strong></p>';
    //   const result = (engine as any).parseNode(testNode);
    //   expect(result).toEqual([
    //     { type: 'element', tagName: 'p', attributes: {}, content: '', isClosing: false },
    //     { type: 'text', content: 'Hello ' },
    //     { type: 'element', tagName: 'strong', attributes: {}, content: '', isClosing: false },
    //     { type: 'text', content: 'World' },
    //     { type: 'element', tagName: 'strong', content: '', isClosing: true },
    //     { type: 'element', tagName: 'p', content: '', isClosing: true },
    //   ]);
    // });
  });
});
