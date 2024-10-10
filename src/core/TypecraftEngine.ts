import {
  TypecraftOptions,
  QueueActionType,
  Direction,
  TextEffect,
  NodeType,
  TypecraftEvent,
  EventCallback,
  HTMLParseNode,
  EasingFunction,
} from './types';
import { CursorManager } from './CursorManager';
import { QueueManager } from './QueueManager';
import { EffectManager } from './EffectsManager';
import { OptionsManager } from './OptionsManager';
import { StateManager } from './StateManager';
import { StringManager } from './StringManager';
import { SpeedManager } from './SpeedManager';
import { EasingManager } from './EasingManager';

export class TypecraftEngine {
  private options: TypecraftOptions;
  private rafId: number | null = null;
  private cursorManager: CursorManager;
  private queueManager: QueueManager;
  private EffectManager: EffectManager;
  private optionsManager: OptionsManager;
  private stateManager: StateManager;
  private stringManager: StringManager;
  private speedManager: SpeedManager;
  private easingManager: EasingManager;

  constructor(element: string | HTMLElement, options: Partial<TypecraftOptions> = {}) {
    this.optionsManager = new OptionsManager();
    this.optionsManager.validateElement(element);
    this.options = this.optionsManager.mergeOptions(options);
    const htmlElement = typeof element === 'string' ? document.querySelector(element)! : element;
    this.stateManager = new StateManager(htmlElement as HTMLElement, this.options);
    this.cursorManager = new CursorManager(htmlElement as HTMLElement, this.options.cursor);
    this.cursorManager.updateCursorPosition(htmlElement as HTMLElement);
    if (this.options.cursor.blink) {
      this.cursorManager.startBlinking();
    }
    this.queueManager = new QueueManager();
    this.EffectManager = new EffectManager();
    this.stringManager = new StringManager(this.queueManager);
    this.speedManager = new SpeedManager(this.options);
    this.easingManager = new EasingManager(this.options);
    this.init();
  }

  private init(): void {
    this.setupCursor();
    const state = this.stateManager.getState();
    state.element.style.direction = this.options.direction;

    if (this.options.autoStart && this.options.strings.length) {
      this.typeAllStrings();
    }
  }

  private getTypeSpeed(): number {
    return this.speedManager.getTypeSpeed(this.easingManager);
  }

  private setupCursor(): void {
    const state = this.stateManager.getState();
    this.cursorManager = new CursorManager(state.element, this.options.cursor);
  }

  private updateCursorStyle(): void {
    const state = this.stateManager.getState();
    const cursorNode = state.cursorNode;
    if (cursorNode) {
      cursorNode.className = `typecraft-cursor typecraft-cursor-${this.options.cursor.style}`;
      cursorNode.style.color = this.options.cursor.color;
    }
  }

  private resetState(): void {
    this.stateManager.clearVisibleNodes();
    const state = this.stateManager.getState();
    state.element.innerHTML = '';
    if (this.cursorManager) {
      this.cursorManager.remove();
    }
    this.cursorManager = new CursorManager(state.element, this.options.cursor);
    this.cursorManager.updateCursorPosition(state.element);
  }

  private emit(eventName: TypecraftEvent, ...args: any[]): void {
    const listeners = this.stateManager.getEventListeners(eventName);
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
        this.typeAllStrings();
        await this.runQueue();
      } else {
        this.checkOperationComplete();
      }
      return;
    }

    const { type, payload } = queueItem;
    this.stateManager.updateLastOperation(type);

    switch (type) {
      case QueueActionType.TYPE:
      case QueueActionType.TYPE_CHARACTER:
        await this.typeCharacter(payload);
        break;
      case QueueActionType.TYPE_HTML_TAG_OPEN:
        await this.typeHtmlTagOpen(payload);
        break;
      case QueueActionType.TYPE_HTML_CONTENT:
        await this.typeHtmlContent(payload.content);
        break;
      case QueueActionType.TYPE_HTML_TAG_CLOSE:
        await this.typeHtmlTagClose(payload);
        break;
      case QueueActionType.DELETE:
      case QueueActionType.DELETE_CHARACTER:
        const state = this.stateManager.getState();
        if (state.visibleNodes.length > 0) {
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
        this.typeAllStrings();
        this.emit('complete');
        break;
      default:
        // eslint-disable-next-line no-console
        console.warn(`Unknown queue action type: ${type}`);
    }

    await this.runQueue();
  }

  private async typeHtmlTagOpen(payload: {
    tagName: string;
    attributes: NamedNodeMap;
  }): Promise<void> {
    const { tagName, attributes } = payload;
    const element = document.createElement(tagName);
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      element.setAttribute(attr.name, attr.value);
    }
    const state = this.stateManager.getState();
    state.element.insertBefore(element, this.cursorManager.getCursorElement());
    this.stateManager.updateVisibleNodes({ type: NodeType.HTMLElement, node: element });
    this.cursorManager.updateCursorPosition(state.element);
    await this.wait(this.getTypeSpeed());
  }

  private async typeHtmlTagClose(payload: { tagName: string }): Promise<void> {
    const state = this.stateManager.getState();
    const lastNode = state.visibleNodes[state.visibleNodes.length - 1];
    if (
      lastNode &&
      lastNode.type === NodeType.HTMLElement &&
      (lastNode.node as HTMLElement).tagName.toLowerCase() === payload.tagName.toLowerCase()
    ) {
      // Move to the next sibling of the closing tag
      const nextSibling = lastNode.node.nextSibling;
      if (nextSibling instanceof HTMLElement) {
        this.cursorManager.updateCursorPosition(nextSibling);
      } else {
        this.cursorManager.updateCursorPosition(state.element);
      }
    }
    await this.wait(this.getTypeSpeed());
  }

  private checkOperationComplete(): void {
    const state = this.stateManager.getState();
    if (state.queue.length === 0) {
      if (state.lastOperation === QueueActionType.TYPE_CHARACTER) {
        this.emit('typeComplete');
      } else if (state.lastOperation === QueueActionType.DELETE_CHARACTER) {
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
    const state = this.stateManager.getState();
    const currentNode = state.visibleNodes[state.visibleNodes.length - 1];

    if (currentNode && currentNode.type === NodeType.HTMLElement) {
      await this.typeHtmlContent(char);
    } else {
      const charSpan = document.createElement('span');
      charSpan.textContent = char;
      state.element.insertBefore(charSpan, this.cursorManager.getCursorElement());
      this.stateManager.updateVisibleNodes({ type: NodeType.Character, node: charSpan });
    }

    this.cursorManager.updateCursorPosition(state.element);

    const typeSpeed =
      typeof this.options.speed === 'number' ? this.options.speed : this.options.speed.type;
    await new Promise((resolve) => setTimeout(resolve, typeSpeed));

    await this.applyTextEffect(this.options.textEffect);
    this.emit('typeChar', { char });
  }

  private async typeHtmlContent(content: string): Promise<void> {
    const state = this.stateManager.getState();
    const currentNode = state.visibleNodes[state.visibleNodes.length - 1];

    if (currentNode && currentNode.type === NodeType.HTMLElement) {
      for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const textNode = document.createTextNode(char);
        (currentNode.node as HTMLElement).appendChild(textNode);
        this.stateManager.updateVisibleNodes({
          type: NodeType.Character,
          node: textNode.parentElement as HTMLElement,
        });
        this.cursorManager.updateCursorPosition(state.element);
        await this.wait(this.getTypeSpeed());
        this.emit('typeChar', { char });
      }
    }
  }

  private async deleteCharacter(): Promise<void> {
    const state = this.stateManager.getState();
    if (state.visibleNodes.length > 0) {
      const lastNode = state.visibleNodes[state.visibleNodes.length - 1];
      this.stateManager.removeLastVisibleNode();
      if (lastNode && lastNode.node.parentNode) {
        lastNode.node.parentNode.removeChild(lastNode.node);
      }
      this.cursorManager.updateCursorPosition(state.element);
      const deleteSpeed =
        typeof this.options.speed === 'number'
          ? this.options.speed
          : this.options.speed.delete || 50;
      await this.wait(deleteSpeed);
      this.emit('deleteChar', { char: lastNode?.node.textContent || '' });
    }
  }

  private async applyTextEffect(effect: TextEffect): Promise<void> {
    if (effect === TextEffect.None) {
      return;
    }

    const state = this.stateManager.getState();
    const nodes = state.visibleNodes
      .filter((node) => node.type === NodeType.Character)
      .map((node) => node.node as HTMLElement);

    for (let i = 0; i < nodes.length; i++) {
      await this.EffectManager.applyTextEffect(
        effect,
        nodes[i],
        i,
        () => this.getTypeSpeed(),
        this.easingManager
      );
    }

    await Promise.resolve();

    this.EffectManager.resetEffectStyles(nodes, effect);
  }

  private async wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.emit('pauseEnd');
        resolve();
      }, ms);
    });
  }

  public setEasingFunction(easing: EasingFunction): this {
    this.easingManager.setEasingFunction(easing);
    return this;
  }

  public changeEasingFunction(easing: EasingFunction): this {
    return this.setEasingFunction(easing);
  }

  public setDirection(direction: Direction): this {
    this.options.direction = direction;
    const state = this.stateManager.getState();
    state.element.style.direction = direction;
    return this;
  }

  public changeSpeed(speed: number): this {
    this.speedManager.changeSpeed(speed);
    return this;
  }

  public changeTypeSpeed(speed: number): this {
    this.speedManager.changeTypeSpeed(speed);
    return this;
  }

  public changeDeleteSpeed(speed: number): this {
    this.speedManager.changeDeleteSpeed(speed);
    return this;
  }

  public changeDelaySpeed(delay: number): this {
    this.speedManager.changeDelaySpeed(delay);
    return this;
  }

  public changeCursor(cursor: string): this {
    this.options.cursor.text = cursor;
    const state = this.stateManager.getState();
    if (state.cursorNode) {
      state.cursorNode.textContent = cursor;
    }
    return this;
  }

  public pauseFor(ms: number): this {
    this.addToQueue(QueueActionType.PAUSE, { ms });
    return this;
  }

  public changeTextEffect(effect: TextEffect): this {
    this.options.textEffect = effect;
    return this;
  }

  public start(): Promise<void> {
    this.resetState();
    this.updateCursorStyle();
    const state = this.stateManager.getState();
    if (this.options.strings.length && !state.queue.length) {
      this.typeAllStrings();
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
    this.stateManager.addEventListener(eventName, callback);
    return this;
  }

  public off(eventName: TypecraftEvent, callback: EventCallback): this {
    this.stateManager.removeEventListener(eventName, callback);
    return this;
  }

  public callFunction(callback: () => void): this {
    this.addToQueue(QueueActionType.CALL_FUNCTION, { callback });
    return this;
  }

  public typeAllStrings(): this {
    this.queueManager.clear();
    const state = this.stateManager.getState();

    this.options.strings.forEach((string, index) => {
      this.stringManager.typeString(string, this.options.html);

      if (index !== this.options.strings.length - 1) {
        this.pauseFor(this.options.pauseFor);
        this.stringManager.deleteAll(state.visibleNodes.length);
      }
    });

    if (this.options.loop) {
      this.addToQueue(QueueActionType.LOOP);
    }

    return this;
  }
}
