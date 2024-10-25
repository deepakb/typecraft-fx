import {
  TypecraftState,
  TypecraftOptions,
  NodeType,
  QueueActionType,
  EventCallback,
} from './types';
import { TypecraftError, ErrorCode, ErrorSeverity } from './TypecraftError';
import { logger } from './TypecraftLogger';

export class StateManager {
  private state: TypecraftState;

  constructor(element: HTMLElement, options: TypecraftOptions) {
    try {
      this.state = this.initializeState(element, options);
      logger.debug('StateManager initialized', { element, options });
    } catch (error) {
      if (error instanceof TypecraftError) {
        throw error;
      } else {
        throw new TypecraftError(
          ErrorCode.INITIALIZATION_ERROR,
          'Failed to initialize StateManager',
          ErrorSeverity.HIGH,
          { originalError: error }
        );
      }
    }
  }

  private initializeState(element: HTMLElement, options: TypecraftOptions): TypecraftState {
    if (!element || !(element instanceof HTMLElement)) {
      throw new TypecraftError(
        ErrorCode.INVALID_ELEMENT,
        'Invalid element provided',
        ErrorSeverity.HIGH,
        { element }
      );
    }
    return {
      element: element,
      queue: [],
      visibleNodes: [],
      lastFrameTime: null,
      pauseUntil: null,
      cursorNode: null,
      currentSpeed: options.speed.type,
      eventQueue: [],
      eventListeners: new Map(),
      cursorBlinkState: true,
      lastCursorBlinkTime: 0,
      cursorPosition: 0,
      lastOperation: null,
      ...options,
    };
  }

  public getState(): TypecraftState {
    return this.state;
  }

  public updateVisibleNodes(node: { type: NodeType; node: HTMLElement }): void {
    if (!node || !node.type || !(node.node instanceof HTMLElement)) {
      throw new TypecraftError(
        ErrorCode.INVALID_INPUT,
        'Invalid node provided',
        ErrorSeverity.HIGH,
        { node }
      );
    }
    this.state.visibleNodes.push(node);
    logger.debug('Visible nodes updated', {
      addedNode: node,
      totalNodes: this.state.visibleNodes.length,
    });
  }

  public removeLastVisibleNode(): void {
    if (this.state.visibleNodes.length === 0) {
      throw new TypecraftError(
        ErrorCode.RUNTIME_ERROR,
        'No visible nodes to remove',
        ErrorSeverity.MEDIUM
      );
    }
    this.state.visibleNodes.pop();
    logger.debug('Last visible node removed', { remainingNodes: this.state.visibleNodes.length });
  }

  public clearVisibleNodes(): void {
    this.state.visibleNodes = [];
    logger.debug('Visible nodes cleared');
  }

  public updateLastOperation(operation: QueueActionType): void {
    if (!operation) {
      throw new TypecraftError(
        ErrorCode.INVALID_INPUT,
        'Invalid operation provided',
        ErrorSeverity.HIGH,
        { operation }
      );
    }
    this.state.lastOperation = operation;
    logger.debug('Last operation updated', { operation });
  }

  public addEventListener(eventName: string, callback: EventCallback): void {
    if (typeof eventName !== 'string' || typeof callback !== 'function') {
      throw new TypecraftError(
        ErrorCode.INVALID_INPUT,
        'Invalid eventName or callback provided',
        ErrorSeverity.HIGH,
        { eventName, callback }
      );
    }
    if (!this.state.eventListeners.has(eventName)) {
      this.state.eventListeners.set(eventName, []);
    }
    this.state.eventListeners.get(eventName)!.push(callback);
    logger.debug('Event listener added', { eventName });
  }

  public removeEventListener(eventName: string, callback: EventCallback): void {
    if (typeof eventName !== 'string' || typeof callback !== 'function') {
      throw new TypecraftError(
        ErrorCode.INVALID_INPUT,
        'Invalid eventName or callback provided',
        ErrorSeverity.HIGH,
        { eventName, callback }
      );
    }
    const listeners = this.state.eventListeners.get(eventName);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
        logger.debug('Event listener removed', { eventName });
      }
    }
  }

  public getEventListeners(eventName: string): EventCallback[] | undefined {
    if (typeof eventName !== 'string') {
      throw new TypecraftError(
        ErrorCode.INVALID_INPUT,
        'Invalid eventName provided',
        ErrorSeverity.HIGH,
        { eventName }
      );
    }
    return this.state.eventListeners.get(eventName);
  }

  public updateCursorBlinkState(state: boolean): void {
    if (typeof state !== 'boolean') {
      throw new TypecraftError(
        ErrorCode.INVALID_INPUT,
        'Invalid state provided',
        ErrorSeverity.HIGH,
        { state }
      );
    }
    this.state.cursorBlinkState = state;
    logger.debug('Cursor blink state updated', { state });
  }

  public updateLastCursorBlinkTime(time: number): void {
    if (typeof time !== 'number' || isNaN(time)) {
      throw new TypecraftError(
        ErrorCode.INVALID_INPUT,
        'Invalid time provided',
        ErrorSeverity.HIGH,
        { time }
      );
    }
    this.state.lastCursorBlinkTime = time;
    logger.debug('Last cursor blink time updated', { time });
  }

  public setCursorNode(node: HTMLElement | null): void {
    if (node !== null && !(node instanceof HTMLElement)) {
      throw new TypecraftError(
        ErrorCode.INVALID_INPUT,
        'Invalid node provided',
        ErrorSeverity.HIGH,
        { node }
      );
    }
    this.state.cursorNode = node;
    logger.debug('Cursor node set', { node });
  }
}
