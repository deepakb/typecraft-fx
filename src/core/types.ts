export interface CursorOptions {
  text: string;
  color: string;
  blinkSpeed: number;
  opacity: {
    min: number;
    max: number;
  };
  cursorStyle: CursorStyle;
}

export interface SpeedOptions {
  type: number;
  delete: number;
  delay: number;
}

export interface TypewriterClass {
  // Core methods
  start(): TypewriterClass;
  stop(): TypewriterClass;

  // Typing methods
  typeString(string: string): TypewriterClass;
  deleteAll(speed?: number): TypewriterClass;
  deleteChars(amount: number): TypewriterClass;
  pauseFor(ms: number): TypewriterClass;
  changeDeleteSpeed(speed: number): TypewriterClass;

  // Options methods
  changeSettings(options: Partial<TypewriterOptions>): TypewriterClass;

  // Event methods
  on(event: TypewriterEvent, callback: EventCallback): TypewriterClass;
  off(event: TypewriterEvent, callback: EventCallback): TypewriterClass;

  // Utility methods
  callFunction(callback: () => void, thisArg?: any): TypewriterClass;
}

export type EasingFunction = (t: number) => number;

export interface TypewriterOptions {
  strings: string[];
  loop: boolean;
  autoStart: boolean;
  cursor: CursorOptions;
  pauseFor: number;
  direction: Direction;
  cursorStyle: CursorStyle;
  textEffect: TextEffect;
  speed: SpeedOptions | number;
  html?: boolean;
  easingFunction?: EasingFunction;
}

export interface TypewriterState {
  element: HTMLElement;
  queue: QueueItem[];
  visibleNodes: VisibleNode[];
  lastFrameTime: number | null;
  pauseUntil: number | null;
  cursorNode: HTMLElement | null;
  currentSpeed: number | 'natural';
  eventQueue: EventQueue;
  eventListeners: Map<TypewriterEvent, EventCallback[]>;
  cursorBlinkState: boolean;
  lastCursorBlinkTime: number;
  cursorPosition: number;
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
  CHANGE_TEXT_EFFECT = 'changeTextEffect',
  DELETE_CHARACTER = 'deleteCharacter',
  CALL_FUNCTION = 'callFunction',
  TYPE_CHARACTER = 'typeCharacter',
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
  Typewriter = 'typewriter',
  Rainbow = 'rainbow',
}

export type TypewriterEvent =
  | 'typeStart'
  | 'typeChar'
  | 'typeComplete'
  | 'deleteStart'
  | 'deleteChar'
  | 'deleteComplete'
  | 'pauseStart'
  | 'pauseEnd'
  | 'complete';

export type EventCallback = (...args: any[]) => void;
