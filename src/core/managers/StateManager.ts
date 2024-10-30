import {
  TypecraftState,
  TypecraftOptions,
  NodeType,
  QueueActionType,
  EventCallback,
} from '../../types';
import { ErrorHandler } from '../../utils/ErrorHandler';
import { ErrorSeverity } from '../error/TypecraftError';
import { ITypecraftLogger } from '../logging/TypecraftLogger';

export interface IStateManager {
  getState(): TypecraftState;
  updateVisibleNodes(node: { type: NodeType; node: HTMLElement }): void;
  removeLastVisibleNode(): void;
  clearVisibleNodes(): void;
  updateLastOperation(operation: QueueActionType): void;
  addEventListener(eventName: string, callback: EventCallback): void;
  removeEventListener(eventName: string, callback: EventCallback): void;
  getEventListeners(eventName: string): EventCallback[] | undefined;
  updateCursorBlinkState(state: boolean): void;
  updateLastCursorBlinkTime(time: number): void;
  setCursorNode(node: HTMLElement | null): void;
  removeNodeAtIndex(index: number): void;
}

export class StateManager implements IStateManager {
  private state: TypecraftState;

  constructor(
    element: HTMLElement,
    options: TypecraftOptions,
    private logger: ITypecraftLogger,
    private errorHandler: ErrorHandler
  ) {
    try {
      this.state = this.initializeState(element, options);
      this.logger.debug('StateManager initialized', { element, options });
    } catch (error) {
      this.errorHandler.handleError(
        error,
        'Failed to initialize StateManager',
        { element, options },
        ErrorSeverity.HIGH
      );
    }
  }

  private initializeState(element: HTMLElement, options: TypecraftOptions): TypecraftState {
    if (!element || !(element instanceof HTMLElement)) {
      this.errorHandler.handleError(
        new Error('Invalid element'),
        'Invalid element provided',
        { element },
        ErrorSeverity.HIGH
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
      this.errorHandler.handleError(
        new Error('Invalid node'),
        'Invalid node provided',
        { node },
        ErrorSeverity.HIGH
      );
    }
    this.state.visibleNodes.push(node);
    this.logger.debug('Visible nodes updated', {
      addedNode: node,
      totalNodes: this.state.visibleNodes.length,
    });
  }

  public removeLastVisibleNode(): void {
    if (this.state.visibleNodes.length === 0) {
      this.errorHandler.handleError(
        new Error('No visible nodes'),
        'No visible nodes to remove',
        {},
        ErrorSeverity.MEDIUM
      );
    }
    this.state.visibleNodes.pop();
    this.logger.debug('Last visible node removed', {
      remainingNodes: this.state.visibleNodes.length,
    });
  }

  public clearVisibleNodes(): void {
    this.state.visibleNodes = [];
    this.logger.debug('Visible nodes cleared');
  }

  public updateLastOperation(operation: QueueActionType): void {
    if (!operation) {
      this.errorHandler.handleError(
        new Error('Invalid operation'),
        'Invalid operation provided',
        { operation },
        ErrorSeverity.HIGH
      );
    }
    this.state.lastOperation = operation;
    this.logger.debug('Last operation updated', { operation });
  }

  public addEventListener(eventName: string, callback: EventCallback): void {
    if (typeof eventName !== 'string' || typeof callback !== 'function') {
      this.errorHandler.handleError(
        new Error('Invalid eventName or callback'),
        'Invalid eventName or callback provided',
        { eventName, callback },
        ErrorSeverity.HIGH
      );
    }
    if (!this.state.eventListeners.has(eventName)) {
      this.state.eventListeners.set(eventName, []);
    }
    this.state.eventListeners.get(eventName)!.push(callback);
    this.logger.debug('Event listener added', { eventName });
  }

  public removeEventListener(eventName: string, callback: EventCallback): void {
    if (typeof eventName !== 'string' || typeof callback !== 'function') {
      this.errorHandler.handleError(
        new Error('Invalid eventName or callback'),
        'Invalid eventName or callback provided',
        { eventName, callback },
        ErrorSeverity.HIGH
      );
    }
    const listeners = this.state.eventListeners.get(eventName);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
        this.logger.debug('Event listener removed', { eventName });
      }
    }
  }

  public getEventListeners(eventName: string): EventCallback[] | undefined {
    if (typeof eventName !== 'string') {
      this.errorHandler.handleError(
        new Error('Invalid eventName'),
        'Invalid eventName provided',
        { eventName },
        ErrorSeverity.HIGH
      );
    }
    return this.state.eventListeners.get(eventName);
  }

  public updateCursorBlinkState(state: boolean): void {
    if (typeof state !== 'boolean') {
      this.errorHandler.handleError(
        new Error('Invalid state'),
        'Invalid state provided',
        { state },
        ErrorSeverity.HIGH
      );
    }
    this.state.cursorBlinkState = state;
    this.logger.debug('Cursor blink state updated', { state });
  }

  public updateLastCursorBlinkTime(time: number): void {
    if (typeof time !== 'number' || isNaN(time)) {
      this.errorHandler.handleError(
        new Error('Invalid time'),
        'Invalid time provided',
        { time },
        ErrorSeverity.HIGH
      );
    }
    this.state.lastCursorBlinkTime = time;
    this.logger.debug('Last cursor blink time updated', { time });
  }

  public setCursorNode(node: HTMLElement | null): void {
    if (node !== null && !(node instanceof HTMLElement)) {
      this.errorHandler.handleError(
        new Error('Invalid node'),
        'Invalid node provided',
        { node },
        ErrorSeverity.HIGH
      );
    }
    this.state.cursorNode = node;
    this.logger.debug('Cursor node set', { node });
  }

  public removeNodeAtIndex(index: number): void {
    try {
      if (index < 0 || index >= this.state.visibleNodes.length) {
        this.errorHandler.handleError(
          new Error('Invalid index'),
          'Index out of bounds in removeNodeAtIndex',
          { index, totalNodes: this.state.visibleNodes.length },
          ErrorSeverity.HIGH
        );
        return;
      }

      const nodeToRemove = this.state.visibleNodes[index];

      if (nodeToRemove.type === NodeType.HTMLElement) {
        // For HTML elements, remove all child nodes from state
        const element = nodeToRemove.node as HTMLElement;
        const childNodes = Array.from(element.querySelectorAll('*'));

        this.state.visibleNodes = this.state.visibleNodes.filter((visibleNode) => {
          const node = visibleNode.node;
          return !childNodes.includes(node as HTMLElement) && node !== element;
        });
      } else {
        // For non-HTML elements, simply remove the node at the index
        this.state.visibleNodes.splice(index, 1);
      }

      this.logger.debug('Node removed at index', {
        index,
        nodeType: nodeToRemove.type,
        remainingNodes: this.state.visibleNodes.length,
      });
    } catch (error) {
      this.errorHandler.handleError(
        error,
        'Error removing node at index',
        { index },
        ErrorSeverity.HIGH
      );
    }
  }
}
