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
  CustomEffectFunction,
  CursorOptions,
  SpeedOptions,
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
  private cursorManager: CursorManager;
  private queueManager: QueueManager;
  private EffectManager: EffectManager;
  private optionsManager: OptionsManager;
  private stateManager: StateManager;
  private stringManager: StringManager;
  private speedManager: SpeedManager;
  private easingManager: EasingManager;
  private rafId: number | null = null;
  private lastFrameTime: number = 0;

  constructor(element: string | HTMLElement, options: Partial<TypecraftOptions> = {}) {
    const htmlElement = typeof element === 'string' ? document.querySelector(element)! : element;
    this.optionsManager = new OptionsManager(htmlElement as HTMLElement, options);
    this.options = this.optionsManager.getOptions();
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

    if (this.options.cursor.blink) {
      this.cursorManager.startBlinking();
    }

    if (this.options.autoStart && this.options.strings.length) {
      this.typeAllStrings();
    }

    this.startAnimationLoop();
  }

  private startAnimationLoop(): void {
    const animate = (currentTime: number) => {
      if (this.lastFrameTime === 0) {
        this.lastFrameTime = currentTime;
      }

      const deltaTime = currentTime - this.lastFrameTime;
      this.update(deltaTime, currentTime);

      this.lastFrameTime = currentTime;
      this.rafId = window.requestAnimationFrame(animate);
    };

    this.rafId = window.requestAnimationFrame(animate);
  }

  private update(deltaTime: number, currentTime: number): void {
    // Update cursor blink
    this.cursorManager.updateBlink(currentTime);

    // Other update logic can be added here
  }

  public getElement(): HTMLElement {
    return this.stateManager.getState().element;
  }

  private getTypeSpeed(): number {
    return this.speedManager.getTypeSpeed(this.easingManager);
  }

  private setupCursor(): void {
    const state = this.stateManager.getState();
    this.cursorManager = new CursorManager(state.element, {
      ...this.options.cursor,
      blink: this.options.cursor.blink || false,
    });
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
    while (true) {
      const queueItem = this.queueManager.getNext();
      if (!queueItem) {
        this.emit('complete');
        if (this.options.loop) {
          this.typeAllStrings();
        } else {
          this.checkOperationComplete();
        }
        break;
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
          if (typeof payload.callback === 'function') {
            await Promise.resolve(payload.callback());
          }
          break;
        case QueueActionType.LOOP:
          this.typeAllStrings();
          this.emit('complete');
          break;
        default:
          console.warn(`Unknown queue action type: ${type}`);
      }
    }
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

  private async typeCharacter({ char, color }: { char: string; color?: string }): Promise<void> {
    const state = this.stateManager.getState();

    if (char === '\n') {
      const br = document.createElement('br');
      state.element.appendChild(br);
      this.stateManager.updateVisibleNodes({ type: NodeType.LineBreak, node: br });
    } else if (char === '\t') {
      const tabSpan = document.createElement('span');
      tabSpan.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;';
      state.element.appendChild(tabSpan);
      this.stateManager.updateVisibleNodes({ type: NodeType.HTMLElement, node: tabSpan });
    } else {
      let lastNode = state.visibleNodes[state.visibleNodes.length - 1];
      if (!lastNode || lastNode.type !== NodeType.Character) {
        const span = document.createElement('span');
        state.element.appendChild(span);
        if (color) {
          span.style.color = color;
        }
        lastNode = { type: NodeType.Character, node: span };
        this.stateManager.updateVisibleNodes({ type: NodeType.Character, node: span });
      }
      if (lastNode.node instanceof HTMLElement) {
        if (color && lastNode.node.style.color !== color) {
          const span = document.createElement('span');
          span.style.color = color;
          span.textContent = char;
          state.element.appendChild(span);
          this.stateManager.updateVisibleNodes({ type: NodeType.Character, node: span });
        } else {
          (lastNode.node as HTMLElement).textContent += char;
        }
      }
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
      if (lastNode.type === NodeType.Character) {
        const span = lastNode.node as HTMLElement;
        const text = span.textContent || '';
        if (text.length > 1) {
          span.textContent = text.slice(0, -1);
        } else {
          this.stateManager.removeLastVisibleNode();
          span.parentNode?.removeChild(span);
        }
      } else {
        this.stateManager.removeLastVisibleNode();
        lastNode.node.parentNode?.removeChild(lastNode.node);
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

    await Promise.all(
      nodes.map((node, i) =>
        this.EffectManager.applyTextEffect(
          effect,
          node,
          i,
          () => this.getTypeSpeed(),
          this.easingManager
        )
      )
    );

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

  public setDirection(direction: Direction): this {
    this.options.direction = direction;
    const state = this.stateManager.getState();
    state.element.style.direction = direction;
    return this;
  }

  public setSpeed(speedOptions: Partial<SpeedOptions>): this {
    this.speedManager.setSpeed(speedOptions);
    return this;
  }

  public changeCursor(cursorOptions: Partial<CursorOptions>): void {
    if (cursorOptions.text !== undefined) {
      this.options.cursor.text = cursorOptions.text;
    }
    if (cursorOptions.color !== undefined) {
      this.options.cursor.color = cursorOptions.color;
    }
    if (cursorOptions.style !== undefined) {
      this.options.cursor.style = cursorOptions.style;
      this.cursorManager.changeCursorStyle(cursorOptions.style);
    }
    if (cursorOptions.blink !== undefined) {
      this.options.cursor.blink = cursorOptions.blink;
      if (cursorOptions.blink) {
        this.cursorManager.startBlinking();
      } else {
        this.cursorManager.stopBlinking();
      }
    }
    if (cursorOptions.blinkSpeed !== undefined) {
      this.options.cursor.blinkSpeed = cursorOptions.blinkSpeed;
      this.cursorManager.changeBlinkSpeed(cursorOptions.blinkSpeed);
    }
    if (cursorOptions.opacity !== undefined) {
      this.options.cursor.opacity = cursorOptions.opacity;
      this.cursorManager.changeOpacity(cursorOptions.opacity);
    }
  }

  public setTextEffect(effect: TextEffect): this {
    this.options.textEffect = effect;
    return this;
  }

  public pauseFor(ms: number): this {
    this.addToQueue(QueueActionType.PAUSE, { ms });
    return this;
  }

  public start(): Promise<void> {
    this.resetState();
    this.updateCursorStyle();
    const state = this.stateManager.getState();
    if (this.options.strings.length && !state.queue.length) {
      this.typeAllStrings();
    }
    return this.runQueue();
  }

  public stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
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
    this.queueManager.add({
      type: QueueActionType.CALL_FUNCTION,
      payload: { callback },
    });
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

  public registerCustomEffect(name: string, effectFunction: CustomEffectFunction): this {
    this.EffectManager.registerCustomEffect(name, effectFunction);
    return this;
  }
}
