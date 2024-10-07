import {
  TypewriterOptions,
  TypewriterState,
  QueueActionType,
  Direction,
  CursorStyle,
  TextEffect,
  NodeType,
  TypewriterEvent,
  EventCallback,
  HTMLParseNode,
  CursorOptions,
  SpeedOptions,
  EasingFunction,
} from './types';
import { VirtualDOM, VNode } from './VirtualDOM';

export class Typewriter {
  private options: TypewriterOptions;
  private state: TypewriterState;
  private vdom: VirtualDOM;
  private rafId: number | null = null;

  constructor(element: string | HTMLElement, options: Partial<TypewriterOptions> = {}) {
    const defaultSpeed: SpeedOptions = {
      type: 50,
      delete: 50,
      delay: 1500,
    };

    const defaultOptions: TypewriterOptions = {
      strings: [],
      speed: defaultSpeed,
      loop: false,
      autoStart: false,
      cursor: {
        text: '|',
        color: 'black',
        blinkSpeed: 500,
        opacity: {
          min: 0,
          max: 1,
        },
        cursorStyle: CursorStyle.Blink,
      },
      pauseFor: 1500,
      direction: Direction.LTR,
      cursorStyle: CursorStyle.Blink,
      textEffect: TextEffect.None,
      easingFunction: options.easingFunction || this.defaultEasing,
    };

    this.options = { ...defaultOptions, ...options } as TypewriterOptions;

    if (typeof this.options.speed === 'number') {
      this.options.speed = {
        type: this.options.speed,
        delete: this.options.speed,
        delay: defaultSpeed.delay,
      };
    }

    this.state = {
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
    };

    if (!this.state.element) {
      throw new Error('Invalid HTML element provided');
    }

    this.vdom = new VirtualDOM();
    this.init();
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

  private setupCursor(): void {
    if (this.state.cursorNode) {
      this.state.cursorNode.remove();
    }

    this.state.cursorNode = document.createElement('span');
    this.state.cursorNode.textContent = this.options.cursor.text;
    this.state.cursorNode.className = `typewriter-cursor typewriter-cursor-${this.options.cursorStyle}`;
    this.state.cursorNode.style.color = this.options.cursor.color;

    this.state.element.appendChild(this.state.cursorNode);

    if (this.options.cursorStyle === CursorStyle.Blink) {
      this.animateCursor();
    }
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

  public typeString(string: string, effect?: TextEffect): this {
    const htmlParseNodes = this.parseHTML(string);
    this.addNodesToQueue(htmlParseNodes, effect);
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

  public setCursor(options: Partial<CursorOptions>): this {
    this.options.cursor = { ...this.options.cursor, ...options };
    if (this.state.cursorNode) {
      Object.assign(this.state.cursorNode.style, {
        color: this.options.cursor.color,
      });
      this.state.cursorNode.textContent = this.options.cursor.text;
    }
    return this;
  }

  public changeCursorStyle(style: CursorStyle): this {
    this.options.cursorStyle = style;
    if (this.state.cursorNode) {
      this.state.cursorNode.className = `typewriter-cursor typewriter-cursor-${style}`;
    }
    return this;
  }

  public changeTextEffect(effect: TextEffect): this {
    this.options.textEffect = effect;
    return this;
  }

  public start(): this {
    this.runQueue();
    return this;
  }

  public stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.state.queue = [];
  }

  public on(eventName: TypewriterEvent, callback: EventCallback): this {
    if (!this.state.eventListeners.has(eventName)) {
      this.state.eventListeners.set(eventName, []);
    }
    this.state.eventListeners.get(eventName)!.push(callback);
    return this;
  }

  public off(eventName: TypewriterEvent, callback: EventCallback): this {
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
    this.options.strings.forEach((string, index) => {
      this.typeString(string);

      if (index !== this.options.strings.length - 1) {
        this.pauseFor(this.options.pauseFor).deleteAll();
      }
    });

    if (this.options.loop) {
      this.addToQueue(QueueActionType.LOOP);
    }

    return this;
  }

  private emit(eventName: TypewriterEvent, ...args: any[]): void {
    const listeners = this.state.eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach((callback) => callback(...args));
    }
  }

  private addToQueue(actionType: QueueActionType, payload?: any): void {
    this.state.queue.push({ type: actionType, payload });
  }

  private async runQueue(): Promise<void> {
    if (this.state.queue.length > 0) {
      const { type, payload } = this.state.queue.shift()!;

      switch (type) {
        case QueueActionType.TYPE_CHARACTER:
          await this.typeCharacter(payload);
          break;
        case QueueActionType.DELETE_CHARACTER:
          await this.deleteCharacter();
          break;
        case QueueActionType.PAUSE:
          await this.wait(payload.ms);
          break;
        case QueueActionType.CALL_FUNCTION:
          payload.callback();
          break;
        case QueueActionType.LOOP:
          this.typeOutAllStrings();
          break;
      }

      requestAnimationFrame(() => this.runQueue());
    } else {
      this.emit('complete');
    }
  }

  private parseHTML(string: string): HTMLParseNode[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(string, 'text/html');
    return this.parseNode(doc.body);
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

  private addNodesToQueue(nodes: HTMLParseNode[], effect?: TextEffect): void {
    nodes.forEach((node) => {
      if (node.type === 'text') {
        this.addToQueue(QueueActionType.TYPE_CHARACTER, {
          char: node.content,
          htmlParseNode: node,
        });
      } else {
        this.addToQueue(QueueActionType.TYPE_CHARACTER, { htmlParseNode: node });
      }
    });

    if (effect) {
      this.addToQueue(QueueActionType.CALL_FUNCTION, {
        callback: () => this.applyTextEffect(effect),
      });
    }
  }

  private async typeCharacter(payload: {
    char?: string;
    htmlParseNode: HTMLParseNode;
  }): Promise<void> {
    this.emit('typeChar', payload);

    let node: VNode;
    if (payload.char) {
      node = { type: 'text', content: payload.char };
    } else {
      node = {
        type: 'element',
        tag: payload.htmlParseNode.tagName!,
        attributes: payload.htmlParseNode.attributes || {},
        children: [],
      };
    }

    this.vdom.addNode(node);
    this.vdom.updateDOM(this.state.element);

    if (payload.htmlParseNode.type === 'element') {
      if (!payload.htmlParseNode.isClosing) {
        const element = document.createElement(payload.htmlParseNode.tagName!);
        Object.entries(payload.htmlParseNode.attributes || {}).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
        this.state.visibleNodes.push({
          type: NodeType.HTMLTag,
          node: element,
          htmlParseNode: payload.htmlParseNode,
        });
      } else {
        const openingTagIndex = this.state.visibleNodes.findIndex(
          (vn) =>
            vn.type === NodeType.HTMLTag &&
            vn.htmlParseNode?.tagName === payload.htmlParseNode.tagName &&
            !vn.htmlParseNode?.isClosing
        );
        if (openingTagIndex !== -1) {
          const childNodes = this.state.visibleNodes.slice(openingTagIndex + 1);
          childNodes.forEach((childNode) => {
            if (childNode.type === NodeType.Character) {
              (this.state.visibleNodes[openingTagIndex].node as HTMLElement).appendChild(
                childNode.node
              );
            }
          });
          this.state.visibleNodes.splice(openingTagIndex + 1, childNodes.length);
        }
      }
    } else {
      this.state.visibleNodes.push({
        type: NodeType.Character,
        node: document.createTextNode(payload.char!),
        htmlParseNode: payload.htmlParseNode,
      });
    }

    this.state.cursorPosition++;

    if (payload.char) {
      await this.wait(this.getTypeSpeed());
    }

    this.updateCursorPosition();
  }

  private updateCursorPosition(): void {
    if (this.state.cursorNode) {
      const lastNode = this.state.visibleNodes[this.state.visibleNodes.length - 1];
      if (lastNode && lastNode.node instanceof HTMLElement) {
        const rect = lastNode.node.getBoundingClientRect();
        this.state.cursorNode.style.left = `${rect.right}px`;
        this.state.cursorNode.style.top = `${rect.top}px`;
      }
    }
  }

  private async deleteCharacter(): Promise<void> {
    this.emit('deleteChar', {
      char: this.state.visibleNodes[this.state.visibleNodes.length - 1]?.node.textContent,
    });

    this.vdom.removeLastNode();
    this.vdom.updateDOM(this.state.element);
    this.state.visibleNodes.pop();
    this.state.cursorPosition--;

    await this.wait(this.getDeleteSpeed());
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

  private getDeleteSpeed(): number {
    const speed =
      typeof this.options.speed === 'object' ? this.options.speed.delete : this.options.speed;
    if (typeof speed === 'number') {
      const easing = this.getEasing();
      return speed === -1 ? Math.random() * (100 - 30) + 30 : easing(speed);
    } else {
      return 50; // Default to 50 if speed is not a number
    }
  }

  private animateCursor(): void {
    if (!this.state.cursorNode) return;

    const now = Date.now();
    const delta = now - this.state.lastCursorBlinkTime;

    if (delta >= this.options.cursor.blinkSpeed) {
      this.state.cursorBlinkState = !this.state.cursorBlinkState;
      this.state.cursorNode.style.opacity = this.state.cursorBlinkState
        ? this.options.cursor.opacity.max.toString()
        : this.options.cursor.opacity.min.toString();
      this.state.lastCursorBlinkTime = now;
    }

    this.rafId = requestAnimationFrame(() => this.animateCursor());
  }

  private async applyTextEffect(effect: TextEffect): Promise<void> {
    const nodes = this.state.visibleNodes.filter((node) => node.type === NodeType.Character);

    switch (effect) {
      case TextEffect.FadeIn:
        nodes.forEach((node, index) => {
          const element = node.node as HTMLElement;
          element.style.opacity = '0';
          element.style.transition = 'opacity 0.1s ease-in-out';

          setTimeout(() => {
            element.style.opacity = '1';
          }, index * 20);
        });
        await this.wait(nodes.length * 20 + 200);
        break;

      case TextEffect.SlideIn:
        nodes.forEach((node, index) => {
          const element = node.node as HTMLElement;
          element.style.transform = 'translateY(20px)';
          element.style.opacity = '0';
          element.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';

          setTimeout(() => {
            element.style.transform = 'translateY(0)';
            element.style.opacity = '1';
          }, index * 20);
        });
        await this.wait(nodes.length * 20 + 200);
        break;

      case TextEffect.Glitch:
        const glitchChars = '!@#$%^&*()_+-={}[]|;:,.<>?';
        nodes.forEach((node, index) => {
          const textNode = node.node as Text;
          const originalChar = textNode.textContent || '';
          let glitchInterval: number;

          setTimeout(() => {
            glitchInterval = window.setInterval(() => {
              textNode.textContent = glitchChars[Math.floor(Math.random() * glitchChars.length)];
            }, 50);

            setTimeout(() => {
              clearInterval(glitchInterval);
              textNode.textContent = originalChar;
            }, 200);
          }, index * 50);
        });
        await this.wait(nodes.length * 50 + 200);
        break;

      case TextEffect.Typewriter:
        nodes.forEach((node, index) => {
          const element = node.node as HTMLElement;
          element.style.visibility = 'hidden';

          setTimeout(() => {
            element.style.visibility = 'visible';
          }, index * this.getTypeSpeed());
        });
        await this.wait(nodes.length * this.getTypeSpeed());
        break;

      case TextEffect.Rainbow:
        const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
        nodes.forEach((node, index) => {
          const element = node.node as HTMLElement;
          element.style.color = colors[index % colors.length];
          element.style.opacity = '0';
          element.style.transition = 'opacity 0.1s ease-in-out';

          setTimeout(() => {
            element.style.opacity = '1';
          }, index * 20);
        });
        await this.wait(nodes.length * 20 + 200);
        break;

      case TextEffect.None:
      default:
        // No effect, do nothing
        break;
    }

    // Reset styles after effect
    nodes.forEach((node) => {
      const element = node.node as HTMLElement;
      element.style.removeProperty('transition');
      element.style.removeProperty('transform');
      element.style.removeProperty('opacity');
      element.style.removeProperty('visibility');
      // Don't reset color for rainbow effect
      if (effect !== TextEffect.Rainbow) {
        element.style.removeProperty('color');
      }
    });
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
