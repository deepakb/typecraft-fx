import { TypecraftEngine } from '../../src/core/TypecraftEngine';
import {
  TypecraftOptions,
  Direction,
  TextEffect,
  QueueActionType,
  NodeType,
  EasingFunction,
  CursorStyle,
} from '../../src/core/types';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the managers
vi.mock('../../src/core/CursorManager');
vi.mock('../../src/core/QueueManager');
vi.mock('../../src/core/EffectsManager');
vi.mock('../../src/core/StateManager');
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
        speed: 100,
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

  // describe('Public Methods', () => {
  //   beforeEach(() => {
  //     engine = new TypecraftEngine(element);
  //   });

  //   it('should set easing function', () => {
  //     const easingFn: EasingFunction = (t: number) => t * t;
  //     const setEasingFunctionSpy = vi.spyOn(engine['easingManager'], 'setEasingFunction');
  //     engine.setEasingFunction(easingFn);
  //     expect(setEasingFunctionSpy).toHaveBeenCalledWith(easingFn);
  //   });

  //   it('should change easing function', () => {
  //     const easingFn: EasingFunction = (t: number) => t * t;
  //     const setEasingFunctionSpy = vi.spyOn(engine['easingManager'], 'setEasingFunction');
  //     engine.changeEasingFunction(easingFn);
  //     expect(setEasingFunctionSpy).toHaveBeenCalledWith(easingFn);
  //   });

  //   it('should set direction', () => {
  //     const setDirectionSpy = vi.spyOn(engine['stateManager'], 'getState');
  //     engine.setDirection(Direction.RTL);
  //     expect(engine['options'].direction).toBe(Direction.RTL);
  //     expect(setDirectionSpy).toHaveBeenCalled();
  //   });

  //   it('should change speed', () => {
  //     const changeSpeedSpy = vi.spyOn(engine['speedManager'], 'changeSpeed');
  //     engine.changeSpeed(200);
  //     expect(changeSpeedSpy).toHaveBeenCalledWith(200);
  //   });

  //   it('should change cursor', () => {
  //     engine.changeCursor('_');
  //     expect(engine['options'].cursor.text).toBe('_');
  //   });

  //   it('should change type speed', () => {
  //     const changeTypeSpeedSpy = vi.spyOn(engine['speedManager'], 'changeTypeSpeed');
  //     engine.changeTypeSpeed(150);
  //     expect(changeTypeSpeedSpy).toHaveBeenCalledWith(150);
  //   });

  //   it('should change delete speed', () => {
  //     const changeDeleteSpeedSpy = vi.spyOn(engine['speedManager'], 'changeDeleteSpeed');
  //     engine.changeDeleteSpeed(75);
  //     expect(changeDeleteSpeedSpy).toHaveBeenCalledWith(75);
  //   });

  //   it('should change delay speed', () => {
  //     const changeDelaySpeedSpy = vi.spyOn(engine['speedManager'], 'changeDelaySpeed');
  //     engine.changeDelaySpeed(2000);
  //     expect(changeDelaySpeedSpy).toHaveBeenCalledWith(2000);
  //   });

  //   it('should pause for specified time', () => {
  //     const addToQueueSpy = vi.spyOn(engine['queueManager'], 'add');
  //     engine.pauseFor(1000);
  //     expect(addToQueueSpy).toHaveBeenCalledWith({
  //       type: QueueActionType.PAUSE,
  //       payload: { ms: 1000 },
  //     });
  //   });

  //   it('should change text effect', () => {
  //     engine.changeTextEffect(TextEffect.FadeIn);
  //     expect(engine['options'].textEffect).toBe(TextEffect.FadeIn);
  //   });

  //   it('should start typing', async () => {
  //     const runQueueSpy = vi.spyOn(engine as any, 'runQueue').mockResolvedValue(undefined);
  //     await engine.start();
  //     expect(runQueueSpy).toHaveBeenCalled();
  //   });

  //   it('should stop typing', () => {
  //     engine['rafId'] = 1;
  //     const clearSpy = vi.spyOn(engine['queueManager'], 'clear');
  //     const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');
  //     engine.stop();
  //     expect(clearSpy).toHaveBeenCalled();
  //     expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(1);
  //   });

  //   it('should add event listener', () => {
  //     const callback = vi.fn();
  //     const addEventListenerSpy = vi.spyOn(engine['stateManager'], 'addEventListener');
  //     engine.on('typeChar', callback);
  //     expect(addEventListenerSpy).toHaveBeenCalledWith('typeChar', callback);
  //   });

  //   it('should remove event listener', () => {
  //     const callback = vi.fn();
  //     const removeEventListenerSpy = vi.spyOn(engine['stateManager'], 'removeEventListener');
  //     engine.off('typeChar', callback);
  //     expect(removeEventListenerSpy).toHaveBeenCalledWith('typeChar', callback);
  //   });

  //   it('should call function', () => {
  //     const callback = vi.fn();
  //     const addToQueueSpy = vi.spyOn(engine['queueManager'], 'add');
  //     engine.callFunction(callback);
  //     expect(addToQueueSpy).toHaveBeenCalledWith({
  //       type: QueueActionType.CALL_FUNCTION,
  //       payload: { callback },
  //     });
  //   });

  //   it('should type out all strings', () => {
  //     engine['options'].strings = ['Hello', 'World'];
  //     const typeStringSpy = vi.spyOn(engine['stringManager'], 'typeString');
  //     const deleteAllSpy = vi.spyOn(engine['stringManager'], 'deleteAll');
  //     engine.typeAllStrings();
  //     expect(typeStringSpy).toHaveBeenCalledTimes(2);
  //     expect(deleteAllSpy).toHaveBeenCalledTimes(1);
  //   });

  //   it('should register custom effect', () => {
  //     const customEffect = vi.fn();
  //     const registerCustomEffectSpy = vi.spyOn(engine['EffectManager'], 'registerCustomEffect');
  //     engine.registerCustomEffect('customEffect', customEffect);
  //     expect(registerCustomEffectSpy).toHaveBeenCalledWith('customEffect', customEffect);
  //   });

  //   it('should get element', () => {
  //     const getStateSpy = vi.spyOn(engine['stateManager'], 'getState').mockReturnValue({
  //       element: element,
  //     } as any);
  //     const result = engine.getElement();
  //     expect(getStateSpy).toHaveBeenCalled();
  //     expect(result).toBe(element);
  //   });
  // });

  // describe('Private Methods', () => {
  //   beforeEach(() => {
  //     engine = new TypecraftEngine(element);
  //   });

  //   it('should emit events', () => {
  //     const callback = vi.fn();
  //     const getEventListenersSpy = vi
  //       .spyOn(engine['stateManager'], 'getEventListeners')
  //       .mockReturnValue([callback]);
  //     (engine as any).emit('typeChar', { char: 'a' });
  //     expect(getEventListenersSpy).toHaveBeenCalledWith('typeChar');
  //     expect(callback).toHaveBeenCalledWith({ char: 'a' });
  //   });

  //   it('should run queue', async () => {
  //     const queueItem = { type: QueueActionType.TYPE_CHARACTER, payload: { char: 'a' } };
  //     vi.spyOn(engine['queueManager'], 'getNext').mockReturnValueOnce(queueItem);
  //     const typeCharacterSpy = vi
  //       .spyOn(engine as any, 'typeCharacter')
  //       .mockResolvedValue(undefined);
  //     await (engine as any).runQueue();
  //     expect(typeCharacterSpy).toHaveBeenCalledWith({ char: 'a' });
  //   });

  //   it('should check operation complete', () => {
  //     const emitSpy = vi.spyOn(engine as any, 'emit');
  //     const getStateSpy = vi.spyOn(engine['stateManager'], 'getState').mockReturnValue({
  //       queue: [],
  //       lastOperation: QueueActionType.TYPE_CHARACTER,
  //     } as any);
  //     (engine as any).checkOperationComplete();
  //     expect(getStateSpy).toHaveBeenCalled();
  //     expect(emitSpy).toHaveBeenCalledWith('typeComplete');
  //     expect(emitSpy).toHaveBeenCalledWith('complete');
  //   });

  //   it('should type character', async () => {
  //     const getStateSpy = vi.spyOn(engine['stateManager'], 'getState').mockReturnValue({
  //       element: element,
  //       visibleNodes: [],
  //     } as any);
  //     const updateVisibleNodesSpy = vi.spyOn(engine['stateManager'], 'updateVisibleNodes');
  //     const updateCursorPositionSpy = vi.spyOn(engine['cursorManager'], 'updateCursorPosition');
  //     const applyTextEffectSpy = vi
  //       .spyOn(engine as any, 'applyTextEffect')
  //       .mockResolvedValue(undefined);

  //     await (engine as any).typeCharacter({ char: 'A' });

  //     expect(getStateSpy).toHaveBeenCalled();
  //     expect(updateVisibleNodesSpy).toHaveBeenCalled();
  //     expect(updateCursorPositionSpy).toHaveBeenCalled();
  //     expect(applyTextEffectSpy).toHaveBeenCalled();
  //     expect(element.textContent).toBe('A');
  //   });

  //   it('should delete character', async () => {
  //     const getStateSpy = vi.spyOn(engine['stateManager'], 'getState').mockReturnValue({
  //       visibleNodes: [{ type: NodeType.Character, node: document.createElement('span') }],
  //       element: element,
  //     } as any);
  //     const removeLastVisibleNodeSpy = vi.spyOn(engine['stateManager'], 'removeLastVisibleNode');
  //     const updateCursorPositionSpy = vi.spyOn(engine['cursorManager'], 'updateCursorPosition');
  //     const waitSpy = vi.spyOn(engine as any, 'wait').mockResolvedValue(undefined);

  //     await (engine as any).deleteCharacter();

  //     expect(getStateSpy).toHaveBeenCalled();
  //     expect(removeLastVisibleNodeSpy).toHaveBeenCalled();
  //     expect(updateCursorPositionSpy).toHaveBeenCalled();
  //     expect(waitSpy).toHaveBeenCalled();
  //   });

  //   it('should apply text effect', async () => {
  //     const getStateSpy = vi.spyOn(engine['stateManager'], 'getState').mockReturnValue({
  //       visibleNodes: [
  //         { type: NodeType.Character, node: document.createElement('span') },
  //         { type: NodeType.Character, node: document.createElement('span') },
  //       ],
  //     } as any);
  //     const applyTextEffectSpy = vi
  //       .spyOn(engine['EffectManager'], 'applyTextEffect')
  //       .mockResolvedValue(undefined);
  //     const resetEffectStylesSpy = vi.spyOn(engine['EffectManager'], 'resetEffectStyles');

  //     await (engine as any).applyTextEffect(TextEffect.FadeIn);

  //     expect(getStateSpy).toHaveBeenCalled();
  //     expect(applyTextEffectSpy).toHaveBeenCalledTimes(2);
  //     expect(resetEffectStylesSpy).toHaveBeenCalled();
  //   });

  //   it('should wait for specified time', async () => {
  //     vi.useFakeTimers();
  //     const emitSpy = vi.spyOn(engine as any, 'emit');

  //     const waitPromise = (engine as any).wait(1000);

  //     vi.advanceTimersByTime(1000);
  //     await waitPromise;

  //     expect(emitSpy).toHaveBeenCalledWith('pauseEnd');
  //     vi.useRealTimers();
  //   });

  //   it('should type HTML tag open', async () => {
  //     const getStateSpy = vi.spyOn(engine['stateManager'], 'getState').mockReturnValue({
  //       element: element,
  //     } as any);
  //     const updateVisibleNodesSpy = vi.spyOn(engine['stateManager'], 'updateVisibleNodes');
  //     const updateCursorPositionSpy = vi.spyOn(engine['cursorManager'], 'updateCursorPosition');
  //     const waitSpy = vi.spyOn(engine as any, 'wait').mockResolvedValue(undefined);

  //     await (engine as any).typeHtmlTagOpen({
  //       tagName: 'div',
  //       attributes: new NamedNodeMap(),
  //     });

  //     expect(getStateSpy).toHaveBeenCalled();
  //     expect(updateVisibleNodesSpy).toHaveBeenCalled();
  //     expect(updateCursorPositionSpy).toHaveBeenCalled();
  //     expect(waitSpy).toHaveBeenCalled();
  //     expect(element.children.length).toBe(1);
  //     expect(element.children[0].tagName).toBe('DIV');
  //   });

  //   it('should type HTML tag close', async () => {
  //     const getStateSpy = vi.spyOn(engine['stateManager'], 'getState').mockReturnValue({
  //       element: element,
  //       visibleNodes: [{ type: NodeType.HTMLElement, node: document.createElement('div') }],
  //     } as any);
  //     const updateCursorPositionSpy = vi.spyOn(engine['cursorManager'], 'updateCursorPosition');
  //     const waitSpy = vi.spyOn(engine as any, 'wait').mockResolvedValue(undefined);

  //     await (engine as any).typeHtmlTagClose({ tagName: 'div' });

  //     expect(getStateSpy).toHaveBeenCalled();
  //     expect(updateCursorPositionSpy).toHaveBeenCalled();
  //     expect(waitSpy).toHaveBeenCalled();
  //     expect(element.innerHTML).toBe('<div></div>');
  //   });

  //   it('should type HTML content', async () => {
  //     const getStateSpy = vi.spyOn(engine['stateManager'], 'getState').mockReturnValue({
  //       element: element,
  //       visibleNodes: [{ type: NodeType.HTMLElement, node: document.createElement('div') }],
  //     } as any);
  //     const updateVisibleNodesSpy = vi.spyOn(engine['stateManager'], 'updateVisibleNodes');
  //     const updateCursorPositionSpy = vi.spyOn(engine['cursorManager'], 'updateCursorPosition');
  //     const waitSpy = vi.spyOn(engine as any, 'wait').mockResolvedValue(undefined);

  //     await (engine as any).typeHtmlContent({ content: 'Hello' });

  //     expect(getStateSpy).toHaveBeenCalled();
  //     expect(updateVisibleNodesSpy).toHaveBeenCalled();
  //     expect(updateCursorPositionSpy).toHaveBeenCalled();
  //     expect(waitSpy).toHaveBeenCalled();
  //     expect(element.innerHTML).toBe('<div>Hello</div>');
  //   });

  //   it('should handle loop', async () => {
  //     engine['options'].loop = true;
  //     const typeAllStringsSpy = vi.spyOn(engine, 'typeAllStrings');
  //     const runQueueSpy = vi.spyOn(engine as any, 'runQueue').mockResolvedValue(undefined);

  //     await (engine as any).handleLoop();

  //     expect(typeAllStringsSpy).toHaveBeenCalled();
  //     expect(runQueueSpy).toHaveBeenCalled();
  //   });

  //   it('should call function', async () => {
  //     const callback = vi.fn();
  //     await (engine as any).callFunction({ callback });
  //     expect(callback).toHaveBeenCalled();
  //   });

  //   it('should change direction', () => {
  //     (engine as any).changeDirection({ direction: Direction.RTL });
  //     expect(engine['options'].direction).toBe(Direction.RTL);
  //   });

  //   it('should change cursor', () => {
  //     const changeCursorStyleSpy = vi.spyOn(engine['cursorManager'], 'changeCursorStyle');
  //     (engine as any).changeCursor({ cursor: '_', style: CursorStyle.Solid });
  //     expect(engine['options'].cursor.text).toBe('_');
  //     expect(changeCursorStyleSpy).toHaveBeenCalledWith(CursorStyle.Solid);
  //   });

  //   it('should change text effect', () => {
  //     (engine as any).changeTextEffect({ effect: TextEffect.FadeIn });
  //     expect(engine['options'].textEffect).toBe(TextEffect.FadeIn);
  //   });
  // });
});
