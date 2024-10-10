import {
  TypecraftState,
  TypecraftOptions,
  NodeType,
  QueueActionType,
  EventCallback,
} from './types';

export class StateManager {
  private state: TypecraftState;

  constructor(element: HTMLElement, options: TypecraftOptions) {
    this.state = this.initializeState(element, options);
  }

  private initializeState(element: HTMLElement, options: TypecraftOptions): TypecraftState {
    return {
      element: element,
      queue: [],
      visibleNodes: [],
      lastFrameTime: null,
      pauseUntil: null,
      cursorNode: null,
      currentSpeed: typeof options.speed === 'number' ? options.speed : 'natural',
      eventQueue: [],
      eventListeners: new Map(),
      cursorBlinkState: true,
      lastCursorBlinkTime: 0,
      cursorPosition: 0,
      lastOperation: null,
    };
  }

  public getState(): TypecraftState {
    return this.state;
  }

  public updateVisibleNodes(node: { type: NodeType; node: HTMLElement }): void {
    this.state.visibleNodes.push(node);
  }

  public removeLastVisibleNode(): void {
    this.state.visibleNodes.pop();
  }

  public clearVisibleNodes(): void {
    this.state.visibleNodes = [];
  }

  public updateLastOperation(operation: QueueActionType): void {
    this.state.lastOperation = operation;
  }

  public addEventListener(eventName: string, callback: EventCallback): void {
    if (!this.state.eventListeners.has(eventName)) {
      this.state.eventListeners.set(eventName, []);
    }
    this.state.eventListeners.get(eventName)!.push(callback);
  }

  public removeEventListener(eventName: string, callback: EventCallback): void {
    const listeners = this.state.eventListeners.get(eventName);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  public getEventListeners(eventName: string): EventCallback[] | undefined {
    return this.state.eventListeners.get(eventName);
  }

  public updateCursorBlinkState(state: boolean): void {
    this.state.cursorBlinkState = state;
  }

  public updateLastCursorBlinkTime(time: number): void {
    this.state.lastCursorBlinkTime = time;
  }

  public setCursorNode(node: HTMLElement | null): void {
    this.state.cursorNode = node;
  }
}
