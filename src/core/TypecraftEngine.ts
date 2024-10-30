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
  TypecraftContext,
} from '../types';
import { CursorManager, ICursorManager } from './managers/CursorManager';
import { IQueueManager } from './managers/QueueManager';
import { IEffectManager } from './managers/EffectManager';
import { IOptionsManager } from './managers/OptionsManager';
import { IStateManager } from './managers/StateManager';
import { IStringManager } from './managers/StringManager';
import { ISpeedManager } from './managers/SpeedManager';
import { IEasingManager } from './managers/EasingManager';
import { ErrorSeverity } from './error/TypecraftError';
import { ITypecraftLogger } from './logging/TypecraftLogger';
import { IManagerFactory } from './factories/ManagerFactory';
import { ErrorHandler } from '../utils/ErrorHandler';

export interface ITypecraftEngine {
  setSpeed(speed: number | Partial<SpeedOptions>): this;
  getElement(): HTMLElement;
  setEasingFunction(easing: EasingFunction): this;
  setDirection(direction: Direction): this;
  changeCursor(cursorOptions: Partial<CursorOptions>): void;
  setTextEffect(effect: TextEffect): this;
  pauseFor(ms: number): this;
  start(): Promise<void>;
  stop(): void;
  on(eventName: TypecraftEvent, callback: EventCallback): this;
  off(eventName: TypecraftEvent, callback: EventCallback): this;
  callFunction(callback: () => void): this;
  typeAllStrings(): void;
  registerCustomEffect(name: string, effectFunction: CustomEffectFunction): this;
  typeString(string: string): this;
  deleteChars(numChars?: number): Promise<void>;
  deleteHtmlNode: (payload: { index: number }) => Promise<void>;
  typeAndReplace(words: string[], delay?: number): this;
  setLoopLastString(value: boolean): this;
}

export class TypecraftEngine implements ITypecraftEngine {
  private isStarted: boolean = false;
  private options: TypecraftOptions;
  private cursorManager: ICursorManager;
  private queueManager: IQueueManager;
  private effectManager: IEffectManager;
  private optionsManager: IOptionsManager;
  private stateManager: IStateManager;
  private stringManager: IStringManager;
  private speedManager: ISpeedManager;
  private easingManager: IEasingManager;
  private rafId: number | null = null;
  private lastFrameTime: number = 0;

  constructor(
    element: string | HTMLElement,
    options: Partial<TypecraftOptions> = {},
    private logger: ITypecraftLogger,
    private errorHandler: ErrorHandler,
    private managerFactory: IManagerFactory
  ) {
    try {
      const htmlElement = this.validateElement(element);
      this.optionsManager = this.managerFactory.createOptionsManager(htmlElement, options);
      this.options = this.optionsManager.getOptions();
      this.stateManager = this.managerFactory.createStateManager(htmlElement, this.options);
      this.queueManager = this.managerFactory.createQueueManager();
      this.easingManager = this.managerFactory.createEasingManager(this.options);
      this.effectManager = this.managerFactory.createEffectManager(this.easingManager);
      this.stringManager = this.managerFactory.createStringManager(this.queueManager);
      this.speedManager = this.managerFactory.createSpeedManager(this.options.speed);
      this.cursorManager = this.managerFactory.createCursorManager(
        this.stateManager.getState().element,
        this.options.cursor
      );

      this.setSpeed(this.options.speed);
      this.init();
      this.logger.info('TypecraftEngine initialized', { element, options });
    } catch (error) {
      this.errorHandler.handleError(
        error,
        'Failed to initialize TypecraftEngine',
        { element, options },
        ErrorSeverity.CRITICAL
      );
    }
  }

  private init(): void {
    const state = this.stateManager.getState();
    state.element.style.direction = this.options.direction;

    this.cursorManager.setupCursor(state.element);

    if (
      this.optionsManager.getOptions().autoStart &&
      this.optionsManager.getOptions().strings.length
    ) {
      this.start();
    }
    this.logger.debug('TypecraftEngine initialized');
  }

  private startAnimationLoop(): void {
    const animate = (currentTime: number) => {
      if (this.lastFrameTime === 0) {
        this.lastFrameTime = currentTime;
      }

      this.updateBlink(currentTime);

      this.lastFrameTime = currentTime;
      this.rafId = window.requestAnimationFrame(animate);
    };

    this.rafId = window.requestAnimationFrame(animate);
    this.logger.debug('Animation loop started');
  }

  private updateBlink(currentTime: number): void {
    this.cursorManager.updateBlink(currentTime);
  }

  public setSpeed(speed: number | Partial<SpeedOptions>): this {
    this.speedManager.setSpeed(speed);
    return this;
  }

  public getElement(): HTMLElement {
    return this.stateManager.getState().element;
  }

  private resetState(): void {
    this.stateManager.clearVisibleNodes();
    const state = this.stateManager.getState();
    state.element.innerHTML = '';
    if (this.cursorManager) {
      this.cursorManager.reset(state.element, this.options.cursor);
    } else {
      this.cursorManager = new CursorManager(
        state.element,
        this.options.cursor,
        this.logger,
        this.errorHandler
      );
    }
    this.logger.debug('State reset');
  }

  private emit(eventName: TypecraftEvent, payload?: any): void {
    const listeners = this.stateManager.getEventListeners(eventName);
    if (listeners) {
      listeners.forEach((callback) => callback(payload));
    }
    this.logger.debug('Event emitted', { eventName, payload });
  }

  private async runQueue(): Promise<void> {
    const context: TypecraftContext = {
      typeCharacter: this.typeCharacter.bind(this),
      typeHtmlTagOpen: this.typeHtmlTagOpen.bind(this),
      typeHtmlContent: this.typeHtmlContent.bind(this),
      typeHtmlTagClose: this.typeHtmlTagClose.bind(this),
      deleteChars: this.deleteChars.bind(this),
      deleteHtmlNode: this.deleteHtmlNode.bind(this),
      wait: this.wait.bind(this),
      typeString: this.typeString.bind(this),
      emit: (eventName: TypecraftEvent, payload?: any) => this.emit(eventName, payload),
      getState: this.stateManager.getState.bind(this.stateManager),
      options: this.options,
    };

    try {
      await this.queueManager.processQueue(context);
      this.emit('complete');
      if (this.options.loop) {
        this.typeAllStrings();
        await this.runQueue();
      } else {
        this.checkOperationComplete();
      }
    } catch (error) {
      this.errorHandler.handleError(error, 'Failed to process queue', {}, ErrorSeverity.HIGH);
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
    const { type } = this.speedManager.getSpeed();
    await this.wait(type);
  }

  private async typeHtmlTagClose(payload: { tagName: string }): Promise<void> {
    const state = this.stateManager.getState();
    const lastNode = state.visibleNodes[state.visibleNodes.length - 1];
    if (
      lastNode &&
      lastNode.type === NodeType.HTMLElement &&
      (lastNode.node as HTMLElement).tagName.toLowerCase() === payload.tagName.toLowerCase()
    ) {
      const nextSibling = lastNode.node.nextSibling;
      if (nextSibling instanceof HTMLElement) {
        this.cursorManager.updateCursorPosition(nextSibling);
      } else {
        this.cursorManager.updateCursorPosition(state.element);
      }
    }
    const { type } = this.speedManager.getSpeed();
    await this.wait(type);
  }

  private checkOperationComplete(): void {
    const state = this.stateManager.getState();
    if (state.queue.length === 0) {
      if (state.lastOperation === QueueActionType.TYPE_CHARACTER) {
        this.emit('typeComplete');
      } else if (state.lastOperation === QueueActionType.DELETE_CHARACTERS) {
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

    const typeSpeed = this.options.speed.type;
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
        const { type } = this.speedManager.getSpeed();
        await this.wait(type);
        this.emit('typeChar', { char });
      }
    }
  }

  public async deleteHtmlNode(payload: { index: number }): Promise<void> {
    const state = this.stateManager.getState();
    const { index } = payload;

    if (index >= 0 && index < state.visibleNodes.length) {
      const node = state.visibleNodes[index];
      if (node.type === NodeType.HTMLElement) {
        // Remove the node from DOM
        node.node.parentNode?.removeChild(node.node);

        // Remove the node and its children from state
        this.stateManager.removeNodeAtIndex(index);

        // Update cursor position
        this.cursorManager.updateCursorPosition(state.element);

        const { delete: deleteSpeed } = this.speedManager.getSpeed();
        await this.wait(deleteSpeed);
        this.emit('deleteComplete');
      }
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

    const { type } = this.speedManager.getSpeed();
    await Promise.all(
      nodes.map((node, i) => this.effectManager.applyTextEffect(effect, node, i, type))
    );

    await Promise.resolve();

    this.effectManager.resetEffectStyles(nodes, effect);
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

  public changeCursor(cursorOptions: Partial<CursorOptions>): void {
    this.cursorManager.changeCursor(cursorOptions);
  }

  public setTextEffect(effect: TextEffect): this {
    this.optionsManager.updateOptions({ textEffect: effect });
    return this;
  }

  public pauseFor(ms: number): this {
    this.queueManager.addPause(ms);
    return this;
  }

  public start(): Promise<void> {
    if (this.isStarted) {
      return Promise.resolve();
    }

    this.isStarted = true;
    try {
      this.resetState();
      const state = this.stateManager.getState();
      this.cursorManager.setupCursor(state.element);
      if (this.options.strings.length && !state.queue.length) {
        this.typeAllStrings();
      }
      if (!this.rafId) {
        this.startAnimationLoop();
      }
      this.logger.info('TypecraftEngine started');
      return this.runQueue();
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'Failed to start TypecraftEngine',
        {},
        ErrorSeverity.HIGH
      );
    }
  }

  public stop(): void {
    if (!this.isStarted) {
      return;
    }

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.queueManager.clear();
    this.isStarted = false;
    this.logger.info('TypecraftEngine stopped');
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
    this.queueManager.addFunction(callback);
    return this;
  }

  public setLoopLastString(value: boolean): this {
    this.options.loopLastString = value;
    return this;
  }

  public typeAllStrings(): void {
    const { strings, loop, pauseFor } = this.options;
    const loopLastString = this.options.loopLastString ?? false;

    if (loopLastString) {
      // Type all strings sequentially first
      strings.forEach((str) => {
        this.typeString(str);
        this.queueManager.addPause(pauseFor);
      });

      // Add the loop action with delete and pause
      this.queueManager.add({
        type: QueueActionType.LOOP_LAST_STRING,
        payload: {
          stringIndex: strings.length - 1,
        },
      });
    } else if (loop) {
      strings.forEach((str, index) => {
        this.typeString(str);
        if (index < strings.length - 1) {
          this.queueManager.addPause(pauseFor);
          this.deleteChars(str.length);
        }
      });

      this.queueManager.add({
        type: QueueActionType.LOOP,
        payload: { startIndex: 0, endIndex: strings.length - 1 },
      });
    } else {
      // Non-loop logic
      strings.forEach((str, index) => {
        this.typeString(str);
        if (index < strings.length - 1) {
          this.queueManager.addPause(pauseFor);
        }
      });
    }
  }

  public registerCustomEffect(name: string, effectFunction: CustomEffectFunction): this {
    this.effectManager.registerCustomEffect(name, effectFunction);
    return this;
  }

  public typeString(str: string): this {
    this.stringManager.typeString(str, this.options.html);
    return this;
  }

  public async deleteChars(numChars: number = 1): Promise<void> {
    this.logger.info('Deleting characters:', { numChars });
    const state = this.stateManager.getState();

    for (let i = 0; i < numChars; i++) {
      if (!state.visibleNodes || state.visibleNodes.length === 0) {
        this.logger.warn('No more visible nodes to delete');
        break;
      }

      const lastNode = state.visibleNodes[state.visibleNodes.length - 1];

      try {
        if (lastNode.type === NodeType.Character) {
          const span = lastNode.node as HTMLElement;
          const text = span.textContent || '';
          if (text.length > 1) {
            span.textContent = text.slice(0, -1);
            this.logger.debug('Character deleted from span, new content:', {
              el: span.textContent,
            });
          } else {
            this.stateManager.removeLastVisibleNode();
            span.parentNode?.removeChild(span);
            this.logger.debug('Span removed');
          }
        } else {
          this.stateManager.removeLastVisibleNode();
          lastNode.node.parentNode?.removeChild(lastNode.node);
          this.logger.debug('Non-character node removed');
        }

        this.cursorManager.updateCursorPosition(state.element);
        this.logger.debug('Cursor position updated');

        const { delete: deleteSpeed } = this.speedManager.getSpeed();
        await this.wait(deleteSpeed);
        this.emit('deleteChar', { char: lastNode?.node.textContent || '' });
      } catch (error) {
        this.errorHandler.handleError(
          error,
          'Error in deleteChars',
          { numChars },
          ErrorSeverity.HIGH
        );
      }
    }

    // Update the element's text content after deletion
    state.element.textContent = state.visibleNodes.map((node) => node.node.textContent).join('');
  }

  public typeAndReplace(words: string[], delay: number = 1000): this {
    const typeWord = (index: number) => {
      this.stringManager.typeWord(words[index]);
      this.pauseFor(delay);
      this.deleteChars(words[index].length + 1); // +1 for the space
      this.callFunction(() => {
        const nextIndex = (index + 1) % words.length;
        typeWord(nextIndex);
      });
    };

    typeWord(0);
    return this;
  }

  private validateElement(element: string | HTMLElement): HTMLElement {
    let htmlElement: HTMLElement;
    if (typeof element === 'string') {
      const el = document.querySelector(element);
      if (!el || !(el instanceof HTMLElement)) {
        this.errorHandler.handleError(
          new Error('Invalid element selector'),
          'Element not found or is not an HTMLElement',
          { element },
          ErrorSeverity.HIGH
        );
      }
      htmlElement = el as HTMLElement;
    } else if (!(element instanceof HTMLElement)) {
      this.errorHandler.handleError(
        new Error('Invalid element'),
        'Provided element is not an HTMLElement',
        { element },
        ErrorSeverity.HIGH
      );
    } else {
      htmlElement = element;
    }
    return htmlElement;
  }
}
