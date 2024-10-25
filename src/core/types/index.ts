import { EasingManager } from '../EasingManager';

export interface CursorOptions {
  text: string;
  color: string;
  blinkSpeed: number;
  opacity: {
    min: number;
    max: number;
  };
  style: CursorStyle;
  blink: boolean;
}

export interface SpeedOptions {
  type: number;
  delete: number;
  delay: number;
}

export type CustomEffectFunction = (
  node: HTMLElement,
  index: number,
  speed: number,
  easingManager: EasingManager
) => void;

export interface TypecraftClass {
  // Core methods
  start(): TypecraftClass;
  stop(): TypecraftClass;

  // Typing methods
  typeString(string: string): TypecraftClass;
  deleteAll(speed?: number): TypecraftClass;
  deleteChars(amount: number): TypecraftClass;
  pauseFor(ms: number): TypecraftClass;
  setSpeed(speed: number): TypecraftClass;

  // Options methods
  changeSettings(options: Partial<TypecraftOptions>): TypecraftClass;

  // Event methods
  on(event: TypecraftEvent, callback: EventCallback): TypecraftClass;
  off(event: TypecraftEvent, callback: EventCallback): TypecraftClass;

  // Utility methods
  callFunction(callback: () => void, thisArg?: any): TypecraftClass;
}

export type EasingFunction = (t: number) => number;

export interface TypecraftOptions {
  strings: string[];
  speed: SpeedOptions;
  loop: boolean;
  autoStart: boolean;
  cursor: CursorOptions;
  pauseFor: number;
  direction: Direction;
  textEffect: TextEffect;
  easingFunction: EasingFunction;
  html: boolean;
}

export interface TypecraftState {
  element: HTMLElement;
  queue: QueueItem[];
  visibleNodes: VisibleNode[];
  lastFrameTime: number | null;
  pauseUntil: number | null;
  cursorNode: HTMLElement | null;
  currentSpeed: number;
  eventQueue: (() => void)[];
  eventListeners: Map<string, EventCallback[]>;
  cursorBlinkState: boolean;
  lastCursorBlinkTime: number;
  cursorPosition: number;
  lastOperation: QueueActionType | null;
}

export type EventQueue = Array<{
  eventName: string;
  eventArgs: any[];
}>;

export enum QueueActionType {
  TYPE = 'type',
  DELETE = 'delete',
  PAUSE = 'pause',
  CALLBACK = 'callback',
  LOOP = 'loop',
  CHANGE_DIRECTION = 'changeDirection',
  CHANGE_CURSOR = 'changeCursor',
  CHANGE_CURSOR_STYLE = 'changeCursorStyle',
  CHANGE_TEXT_EFFECT = 'setTextEffect',
  DELETE_CHARACTERS = 'deleteChars',
  CALL_FUNCTION = 'callFunction',
  TYPE_CHARACTER = 'typeCharacter',
  TYPE_HTML_TAG_OPEN = 'typeHtmlTagOpen',
  TYPE_HTML_TAG_CLOSE = 'typeHtmlTagClose',
  TYPE_HTML_CONTENT = 'typeHtmlContent',
  WORD_REPLACE_START = 'wordReplaceStart',
  WORD_REPLACE_END = 'wordReplaceEnd',
}

export interface QueueItem {
  type: QueueActionType;
  payload: any;
  execute?: () => Promise<void>;
}

export interface HTMLParseNode {
  type: 'text' | 'element';
  content: string;
  tagName?: string;
  attributes?: { [key: string]: string };
  children?: HTMLParseNode[];
  isClosing?: boolean;
}

export interface VisibleNode {
  type: NodeType;
  node: Node;
  htmlParseNode?: HTMLParseNode;
}

export enum NodeType {
  Character = 'character',
  HTMLTag = 'htmlTag',
  HTMLElement = 'htmlElement',
  LineBreak = 'lineBreak',
  Tab = 'tab',
}

export enum Direction {
  LTR = 'ltr',
  RTL = 'rtl',
}

export enum CursorStyle {
  Blink = 'blink',
  Smooth = 'smooth',
  Solid = 'solid',
}

export enum TextEffect {
  None = 'none',
  FadeIn = 'fadeIn',
  SlideIn = 'slideIn',
  Glitch = 'glitch',
  Typecraft = 'typecraft',
  Rainbow = 'rainbow',
  Continuous = 'continuous',
  Custom = 'custom',
}

export type TypecraftEvent =
  | 'typeStart'
  | 'typeChar'
  | 'typeComplete'
  | 'deleteStart'
  | 'deleteChar'
  | 'deleteComplete'
  | 'deleteSkipped'
  | 'pauseStart'
  | 'pauseEnd'
  | 'complete'
  | 'wordReplaceStart'
  | 'wordReplaceEnd';

export type EventCallback = (...args: any[]) => void;
