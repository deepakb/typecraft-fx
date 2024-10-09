/* eslint-disable no-unused-vars */

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

export interface TypecraftClass {
  // Core methods
  start(): TypecraftClass;
  stop(): TypecraftClass;

  // Typing methods
  typeString(string: string): TypecraftClass;
  deleteAll(speed?: number): TypecraftClass;
  deleteChars(amount: number): TypecraftClass;
  pauseFor(ms: number): TypecraftClass;
  changeDeleteSpeed(speed: number): TypecraftClass;

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
  speed: SpeedOptions | number;
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
  currentSpeed: number | 'natural';
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
  Typecraft = 'typecraft',
  Rainbow = 'rainbow',
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
  | 'complete';

export type EventCallback = (...args: any[]) => void;
