import {
  TypecraftOptions,
  TypecraftState,
  QueueActionType,
  Direction,
  CursorStyle,
  TextEffect,
  NodeType,
  TypecraftEvent,
  EventCallback,
  HTMLParseNode,
  EasingFunction,
} from './types';
import { CursorManager } from './CursorManager';
import { QueueManager } from './QueueManager';
import { TextEffectManager } from './TextEffectManager';

export class TypecraftEngine {
  private options: TypecraftOptions;
  private state: TypecraftState;
  private rafId: number | null = null;
  private cursorManager: CursorManager;
  private queueManager: QueueManager;
  private textEffectManager: TextEffectManager;

  constructor(element: string | HTMLElement, options: Partial<TypecraftOptions> = {}) {
    this.validateElement(element);
    this.options = this.mergeOptions(options);
    this.state = this.initializeState(element);
    this.cursorManager = new CursorManager(this.state.element, this.options.cursor);
    this.cursorManager.updateCursorPosition(this.state.element);
    this.queueManager = new QueueManager();
    this.textEffectManager = new TextEffectManager();
    this.init();
  }

  private validateElement(element: string | HTMLElement): void {
    if (typeof element === 'string') {
      const el = document.querySelector(element);
      if (!el) {
        throw new Error(`Element with selector "${element}" not found`);
      }
    } else if (!(element instanceof HTMLElement)) {
      throw new Error('Invalid HTML element provided');
    }
  }

  private mergeOptions(options: Partial<TypecraftOptions>): TypecraftOptions {
    const defaultOptions: TypecraftOptions = {
      strings: [],
      speed: 50,
      pauseFor: 1500,
      loop: false,
      autoStart: false,
      cursor: {
        text: '|',
        color: 'black',
        blinkSpeed: 500,
        opacity: { min: 0, max: 1 },
        style: CursorStyle.Solid,
        blink: false,
      },
      direction: Direction.LTR,
      textEffect: TextEffect.None,
      easingFunction: (t) => t,
      html: false,
    };

    return {
      ...defaultOptions,
      ...options,
      cursor: {
        ...defaultOptions.cursor,
        ...options.cursor,
      },
    };
  }

  private initializeState(element: string | HTMLElement): TypecraftState {
    return {
      element: typeof element === 'string' ? document.querySelector(element)! : element,
      queue: [],
      visibleNodes: [],
      lastFrameTime: null,
      pauseUntil: null,
      cursorNode: null,
      currentSpeed: typeof this.options.speed === 'number' ? this.options.speed : 'natural',
      eventQueue: [],
      eventListeners: new Map(),
      cursorBlinkState: true,
      lastCursorBlinkTime: 0,
      cursorPosition: 0,
      lastOperation: null,
    };
  }

  private init(): void {
    this.setupCursor();
    this.state.element.style.direction = this.options.direction;

    if (this.options.autoStart && this.options.strings.length) {
      this.typeOutAllStrings();
    }
  }

  private defaultEasing: EasingFunction = (t: number) => t;

  private getEasing(): EasingFunction {
    return this.options.easingFunction || this.defaultEasing;
  }

  public setEasingFunction(easing: EasingFunction): this {
    this.options.easingFunction = easing;
    return this;
  }

  public changeEasingFunction(easing: EasingFunction): this {
    this.options.easingFunction = easing;
    return this;
  }

  public setDirection(direction: Direction): this {
    this.options.direction = direction;
    this.state.element.style.direction = direction;
    return this;
  }

  public changeSpeed(speed: number): this {
    if (typeof this.options.speed === 'object') {
      this.options.speed.type = speed;
      this.options.speed.delete = speed;
    } else {
      this.options.speed = speed;
    }
    return this;
  }

  public changeCursor(cursor: string): this {
    this.options.cursor.text = cursor;
    if (this.state.cursorNode) {
      this.state.cursorNode.textContent = cursor;
    }
    return this;
  }

  public changeTypeSpeed(speed: number): this {
    if (typeof this.options.speed === 'object') {
      this.options.speed.type = speed;
    } else {
      this.options.speed = { type: speed, delete: speed, delay: 1500 };
    }
    return this;
  }

  public changeDeleteSpeed(speed: number): this {
    if (typeof this.options.speed === 'object') {
      this.options.speed.delete = speed;
    } else {
      this.options.speed = { type: speed, delete: speed, delay: 1500 };
    }
    return this;
  }

  public changeDelaySpeed(delay: number): this {
    if (typeof this.options.speed === 'object') {
      this.options.speed.delay = delay;
    } else {
      this.options.speed = { type: 50, delete: 50, delay: delay };
    }
    return this;
  }

  public typeString(string: string): this {
    string.split('').forEach((char) => {
      this.addToQueue(QueueActionType.TYPE_CHARACTER, { char });
    });
    return this;
  }

  public deleteChars(numChars: number): this {
    for (let i = 0; i < numChars; i++) {
      this.addToQueue(QueueActionType.DELETE_CHARACTER);
    }
    return this;
  }

  public deleteAll(): this {
    return this.deleteChars(this.state.visibleNodes.length);
  }

  public pauseFor(ms: number): this {
    this.addToQueue(QueueActionType.PAUSE, { ms });
    return this;
  }

  private setupCursor(): void {
    this.cursorManager = new CursorManager(this.state.element, this.options.cursor);
  }

  private updateCursorStyle(): void {
    if (this.state.cursorNode) {
      this.state.cursorNode.className = `typecraft-cursor typecraft-cursor-${this.options.cursor.style}`;
      this.state.cursorNode.style.color = this.options.cursor.color;
    }
  }

  public changeCursorStyle(style: CursorStyle): this {
    this.options.cursor.style = style;
    this.cursorManager.changeCursorStyle(style);
    return this;
  }

  public changeTextEffect(effect: TextEffect): this {
    this.options.textEffect = effect;
    return this;
  }

  private updateCursorPosition(): void {
    this.cursorManager.updateCursorPosition(this.state.element);
  }

  public start(): Promise<void> {
    this.setupCursor();
    this.updateCursorPosition();
    this.updateCursorStyle();
    if (this.options.strings.length && !this.state.queue.length) {
      this.typeOutAllStrings();
    }
    return new Promise((resolve) => {
      this.runQueue().then(() => {
        resolve();
      });
    });
  }

  public stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.queueManager.clear();
  }

  public on(eventName: TypecraftEvent, callback: EventCallback): this {
    if (!this.state.eventListeners.has(eventName)) {
      this.state.eventListeners.set(eventName, []);
    }
    this.state.eventListeners.get(eventName)!.push(callback);
    return this;
  }

  public off(eventName: TypecraftEvent, callback: EventCallback): this {
    const listeners = this.state.eventListeners.get(eventName);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
    return this;
  }

  public callFunction(callback: () => void): this {
    this.addToQueue(QueueActionType.CALL_FUNCTION, { callback });
    return this;
  }

  public typeOutAllStrings(): this {
    this.state.queue = [];

    this.options.strings.forEach((string, index) => {
      // Type the string
      this.typeString(string);

      // If it's not the last string, add pause and delete actions
      if (index !== this.options.strings.length - 1) {
        this.pauseFor(this.options.pauseFor);
        this.deleteAll();
      }
    });

    if (this.options.loop) {
      this.addToQueue(QueueActionType.LOOP);
    }

    return this;
  }

  private emit(eventName: TypecraftEvent, ...args: any[]): void {
    const listeners = this.state.eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach((callback) => callback(...args));
    }
  }

  private addToQueue(actionType: QueueActionType, payload?: any): void {
    this.queueManager.add({ type: actionType, payload });
  }

  private async runQueue(): Promise<void> {
    const queueItem = this.queueManager.getNext();
    if (!queueItem) {
      this.emit('complete');
      if (this.options.loop) {
        this.typeOutAllStrings();
        await this.runQueue();
      } else {
        this.checkOperationComplete();
      }
      return;
    }

    const { type, payload } = queueItem;
    this.state.lastOperation = type;

    switch (type) {
      case QueueActionType.TYPE:
      case QueueActionType.TYPE_CHARACTER:
        await this.typeCharacter(payload);
        break;
      case QueueActionType.DELETE:
      case QueueActionType.DELETE_CHARACTER:
        if (this.state.visibleNodes.length > 0) {
          await this.deleteCharacter();
        } else {
          this.emit('deleteSkipped');
        }
        break;
      case QueueActionType.PAUSE:
        await this.wait(payload.ms);
        break;
      case QueueActionType.CALLBACK:
      case QueueActionType.CALL_FUNCTION:
        await Promise.resolve(payload.callback());
        break;
      case QueueActionType.LOOP:
        this.typeOutAllStrings();
        this.emit('complete');
        break;
      default:
        // eslint-disable-next-line no-console
        console.warn(`Unknown queue action type: ${type}`);
    }

    // Continue processing the queue
    await this.runQueue();
  }

  private checkOperationComplete(): void {
    if (this.state.queue.length === 0) {
      if (this.state.lastOperation === QueueActionType.TYPE_CHARACTER) {
        this.emit('typeComplete');
      } else if (this.state.lastOperation === QueueActionType.DELETE_CHARACTER) {
        this.emit('deleteComplete');
      }
      this.emit('complete');
    }
  }

  private parseNode(node: Node): HTMLParseNode[] {
    const nodes: HTMLParseNode[] = [];

    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        nodes.push({ type: 'text', content: child.textContent || '' });
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as Element;
        const attributes: { [key: string]: string } = {};
        element.getAttributeNames().forEach((name) => {
          attributes[name] = element.getAttribute(name) || '';
        });

        nodes.push({
          type: 'element',
          tagName: element.tagName.toLowerCase(),
          attributes,
          content: '',
          isClosing: false,
        });

        nodes.push(...this.parseNode(element));

        nodes.push({
          type: 'element',
          tagName: element.tagName.toLowerCase(),
          content: '',
          isClosing: true,
        });
      }
    });

    return nodes;
  }

  private async typeCharacter(payload: { char: string }): Promise<void> {
    const { char } = payload;
    const charSpan = document.createElement('span');
    charSpan.textContent = char;
    this.state.element.appendChild(charSpan);
    this.state.visibleNodes.push({ type: NodeType.Character, node: charSpan });
    this.cursorManager.updateCursorPosition(this.state.element);
    this.applyTextEffect(this.options.textEffect);
    await this.wait(
      typeof this.options.speed === 'number' ? this.options.speed : this.options.speed.type
    );
    this.emit('typeChar', { char });
  }

  private async deleteCharacter(): Promise<void> {
    if (this.state.visibleNodes.length > 0) {
      const lastNode = this.state.visibleNodes.pop();
      if (lastNode && lastNode.node.parentNode) {
        lastNode.node.parentNode.removeChild(lastNode.node);
      }
      this.cursorManager.updateCursorPosition(this.state.element);
      const deleteSpeed =
        typeof this.options.speed === 'number'
          ? this.options.speed
          : this.options.speed.delete || 50;
      await this.wait(deleteSpeed);
      this.emit('deleteChar', { char: lastNode?.node.textContent || '' });
    }
  }

  private getTypeSpeed(): number {
    const speed =
      typeof this.options.speed === 'object' ? this.options.speed.type : this.options.speed;
    if (typeof speed === 'number') {
      const easing = this.getEasing();
      return easing(speed);
    } else if (speed === 'natural') {
      return Math.random() * (150 - 50) + 50;
    } else {
      return 50; // Default value if speed is neither a number nor 'natural'
    }
  }

  private animateCursor(): void {
    if (!this.state.cursorNode) {
      return;
    }

    const now = Date.now();
    const delta = now - (this.state.lastCursorBlinkTime || 0);

    if (delta >= this.options.cursor.blinkSpeed) {
      this.state.cursorBlinkState = !this.state.cursorBlinkState;
      this.state.cursorNode.style.opacity = this.state.cursorBlinkState
        ? this.options.cursor.opacity.max.toString()
        : this.options.cursor.opacity.min.toString();
      this.state.lastCursorBlinkTime = now;
    }

    if (this.options.cursor.blink) {
      this.rafId = requestAnimationFrame(() => this.animateCursor());
    }
  }

  private async applyTextEffect(effect: TextEffect): Promise<void> {
    const nodes = this.state.visibleNodes
      .filter((node) => node.type === NodeType.Character)
      .map((node) => node.node as HTMLElement);

    for (let i = 0; i < nodes.length; i++) {
      await this.textEffectManager.applyTextEffect(effect, nodes[i], i, () => this.getTypeSpeed());
    }

    await new Promise((resolve) => setTimeout(resolve, 100));

    this.textEffectManager.resetEffectStyles(nodes, effect);
  }

  private async wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.emit('pauseEnd');
        resolve();
      }, ms);
    });
  }
}
