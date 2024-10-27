import { describe, it, expect, beforeEach } from 'vitest';
import { StateManager } from '../../src/core/managers/StateManager';
import {
  TypecraftOptions,
  NodeType,
  QueueActionType,
  EventCallback,
  CursorStyle,
  Direction,
  TextEffect,
} from '../../src/types';

describe('StateManager', () => {
  let stateManager: StateManager;
  let mockElement: HTMLElement;
  let mockOptions: TypecraftOptions;

  beforeEach(() => {
    mockElement = document.createElement('div');
    mockOptions = {
      speed: { type: 50, delete: 50, delay: 1500 },
      strings: ['Test'],
      loop: false,
      autoStart: false,
      cursor: {
        text: '|',
        color: 'black',
        blinkSpeed: 500,
        opacity: { min: 0, max: 1 },
        style: CursorStyle.Solid,
        blink: true,
      },
      pauseFor: 1500,
      direction: Direction.LTR,
      textEffect: TextEffect.None,
      easingFunction: (t) => t,
      html: false,
    };
    stateManager = new StateManager(mockElement, mockOptions);
  });

  it('should initialize state correctly', () => {
    const state = stateManager.getState();
    expect(state.element).toBe(mockElement);
    expect(state.queue).toEqual([]);
    expect(state.visibleNodes).toEqual([]);
    expect(state.lastFrameTime).toBeNull();
    expect(state.pauseUntil).toBeNull();
    expect(state.cursorNode).toBeNull();
    expect(state.currentSpeed).toBe(50);
    expect(state.eventQueue).toEqual([]);
    expect(state.eventListeners).toBeInstanceOf(Map);
    expect(state.cursorBlinkState).toBe(true);
    expect(state.lastCursorBlinkTime).toBe(0);
    expect(state.cursorPosition).toBe(0);
    expect(state.lastOperation).toBeNull();
  });

  it('should update visible nodes', () => {
    const mockNode = { type: NodeType.Character, node: document.createElement('span') };
    stateManager.updateVisibleNodes(mockNode);
    expect(stateManager.getState().visibleNodes).toContain(mockNode);
  });

  it('should remove last visible node', () => {
    const mockNode1 = { type: NodeType.Character, node: document.createElement('span') };
    const mockNode2 = { type: NodeType.Character, node: document.createElement('span') };
    stateManager.updateVisibleNodes(mockNode1);
    stateManager.updateVisibleNodes(mockNode2);
    stateManager.removeLastVisibleNode();
    expect(stateManager.getState().visibleNodes).toEqual([mockNode1]);
  });

  it('should clear visible nodes', () => {
    const mockNode = { type: NodeType.Character, node: document.createElement('span') };
    stateManager.updateVisibleNodes(mockNode);
    stateManager.clearVisibleNodes();
    expect(stateManager.getState().visibleNodes).toEqual([]);
  });

  it('should update last operation', () => {
    stateManager.updateLastOperation(QueueActionType.TYPE_CHARACTER);
    expect(stateManager.getState().lastOperation).toBe(QueueActionType.TYPE_CHARACTER);
  });

  it('should add event listener', () => {
    const mockCallback: EventCallback = () => {};
    stateManager.addEventListener('typeStart', mockCallback);
    expect(stateManager.getEventListeners('typeStart')).toContain(mockCallback);
  });

  it('should remove event listener', () => {
    const mockCallback: EventCallback = () => {};
    stateManager.addEventListener('typeStart', mockCallback);
    stateManager.removeEventListener('typeStart', mockCallback);
    expect(stateManager.getEventListeners('typeStart')).not.toContain(mockCallback);
  });

  it('should get event listeners', () => {
    const mockCallback: EventCallback = () => {};
    stateManager.addEventListener('typeStart', mockCallback);
    expect(stateManager.getEventListeners('typeStart')).toEqual([mockCallback]);
  });

  it('should update cursor blink state', () => {
    stateManager.updateCursorBlinkState(false);
    expect(stateManager.getState().cursorBlinkState).toBe(false);
  });

  it('should update last cursor blink time', () => {
    const mockTime = 1000;
    stateManager.updateLastCursorBlinkTime(mockTime);
    expect(stateManager.getState().lastCursorBlinkTime).toBe(mockTime);
  });

  it('should set cursor node', () => {
    const mockCursorNode = document.createElement('span');
    stateManager.setCursorNode(mockCursorNode);
    expect(stateManager.getState().cursorNode).toBe(mockCursorNode);
  });
});
