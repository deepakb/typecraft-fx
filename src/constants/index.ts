import { TypecraftOptions, CursorStyle, Direction, TextEffect } from '../types';

// Animation and performance constants
export const ANIMATION_FRAME_RATE = 60;
export const MIN_TYPING_SPEED = 1;
export const MAX_TYPING_SPEED = 1000;
export const MIN_BLINK_SPEED = 100;
export const MAX_BLINK_SPEED = 2000;
export const MAX_QUEUE_SIZE = 1000;

// Default options
export const DEFAULT_TYPE_SPEED = 50;
export const DEFAULT_DELETE_SPEED = 50;
export const DEFAULT_DELAY = 1500;
export const DEFAULT_CURSOR_TEXT = '|';
export const DEFAULT_CURSOR_COLOR = 'black';
export const DEFAULT_CURSOR_BLINK_SPEED = 500;
export const DEFAULT_CURSOR_OPACITY_MIN = 0;
export const DEFAULT_CURSOR_OPACITY_MAX = 1;

export const DEFAULT_EASING_FUNCTION = (t: number) => t;

export const DEFAULT_HTML_PARSER_OPTIONS = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'br'],
  ALLOWED_ATTR: ['style', 'class'],
};

export const DEFAULT_OPTIONS: TypecraftOptions = {
  strings: [],
  loopLastString: false,
  speed: {
    type: DEFAULT_TYPE_SPEED,
    delete: DEFAULT_DELETE_SPEED,
    delay: DEFAULT_DELAY,
  },
  pauseFor: DEFAULT_DELAY,
  loop: false,
  autoStart: false,
  cursor: {
    text: DEFAULT_CURSOR_TEXT,
    color: DEFAULT_CURSOR_COLOR,
    blinkSpeed: DEFAULT_CURSOR_BLINK_SPEED,
    opacity: {
      min: DEFAULT_CURSOR_OPACITY_MIN,
      max: DEFAULT_CURSOR_OPACITY_MAX,
    },
    style: CursorStyle.Solid,
    blink: true,
  },
  direction: Direction.LTR,
  textEffect: TextEffect.None,
  easingFunction: DEFAULT_EASING_FUNCTION,
  html: false,
};
