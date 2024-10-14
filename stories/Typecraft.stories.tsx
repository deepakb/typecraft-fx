import { fn } from '@storybook/test';
import { TypecraftFX, Direction, CursorStyle, TextEffect, TypecraftEngine } from '../src';

export const ActionsData = {
  onInit: fn(),
  onComplete: fn(),
  onTypeStart: fn(),
};

export default {
  component: TypecraftFX,
  title: 'TypecraftFX',
  tags: ['autodocs'],
  excludeStories: /.*Data$/,
  args: {
    ...ActionsData,
  },
  argTypes: {
    strings: { control: 'object' },
    speed: {
      control: { type: 'object' },
      description: 'Typing speed configuration',
    },
    loop: { control: 'boolean' },
    autoStart: { control: 'boolean' },
    pauseFor: { control: 'number' },
    direction: { control: { type: 'select', options: Direction } },
    textEffect: { control: { type: 'select', options: TextEffect } },
    html: { control: 'boolean' },
    cursor: {
      control: 'object',
      description: 'Cursor configuration',
    },
  },
};

export const Default = {
  args: {
    strings: ['Welcome to TypecraftFX', 'A powerful typing animation library'],
    speed: { type: 50, delete: 50, delay: 1000 },
    loop: false,
    autoStart: true,
  },
};

export const LoopingText = {
  args: {
    ...Default.args,
    strings: ['First string', 'Second string', 'Third string'],
    loop: true,
    pauseFor: 1000,
  },
};

export const CustomCursor = {
  args: {
    ...Default.args,
    strings: ['Custom cursor example'],
    cursor: {
      text: '_',
      color: 'red',
      blinkSpeed: 800,
      style: CursorStyle.Blink,
      blink: true,
      opacity: { min: 0, max: 1 },
    },
  },
};

export const RTLText = {
  args: {
    ...Default.args,
    strings: ['مرحبا بكم في TypecraftFX', 'مكتبة رسوم متحركة قوية للكتابة'],
    direction: Direction.RTL,
  },
};

export const HTMLContent = {
  args: {
    ...Default.args,
    strings: [
      'Welcome to <strong>TypecraftFX</strong>',
      'Supports <em>HTML</em> content',
      '<span style="color: blue;">Colored text</span>',
    ],
    html: true,
  },
};

export const TextEffectFadeIn = {
  args: {
    ...Default.args,
    strings: ['This text fades in'],
    textEffect: TextEffect.FadeIn,
  },
};

export const TextEffectSlideIn = {
  args: {
    ...Default.args,
    strings: ['This text slides in'],
    textEffect: TextEffect.SlideIn,
  },
};

export const TextEffectGlitch = {
  args: {
    ...Default.args,
    strings: ['This text has a glitch effect'],
    textEffect: TextEffect.Glitch,
  },
};

export const TextEffectTypecraft = {
  args: {
    ...Default.args,
    strings: ['Typecraft effect in action'],
    textEffect: TextEffect.Typecraft,
  },
};

export const TextEffectRainbow = {
  args: {
    ...Default.args,
    strings: ['Rainbow colored text'],
    textEffect: TextEffect.Rainbow,
  },
};

export const TextEffectContinuous = {
  args: {
    ...Default.args,
    strings: ['Continuous colored text'],
    textEffect: TextEffect.Continuous,
  },
};

export const DifferentSpeeds = {
  args: {
    ...Default.args,
    strings: ['Fast typing', 'Slow typing', 'Normal speed'],
    speed: { type: 10, delete: 5, delay: 500 },
  },
};

export const LongPauseBetweenStrings = {
  args: {
    ...Default.args,
    strings: ['First string', 'Long pause', 'Third string'],
    pauseFor: 3000,
  },
};

export const NoAutoStart = {
  args: {
    ...Default.args,
    strings: ["This won't start automatically", 'You need to call .start()'],
    autoStart: false,
  },
};

export const CursorStyleSolid = {
  args: {
    ...Default.args,
    strings: ['Solid cursor style'],
    cursor: {
      style: CursorStyle.Solid,
      blink: false,
      text: '_',
      color: 'red',
      blinkSpeed: 800,
      opacity: { min: 0, max: 1 },
    },
  },
};

export const CursorStyleBlink = {
  args: {
    ...Default.args,
    strings: ['Blinking cursor style'],
    cursor: {
      style: CursorStyle.Blink,
      blink: true,
      blinkSpeed: 500,
      text: '_',
      color: 'red',
      opacity: { min: 0, max: 1 },
    },
  },
};

export const CursorStyleSmooth = {
  args: {
    ...Default.args,
    strings: ['Smooth cursor style'],
    cursor: {
      style: CursorStyle.Smooth,
      blink: true,
      blinkSpeed: 500,
      text: '_',
      color: 'red',
      opacity: { min: 0, max: 1 },
    },
  },
};

export const CustomCursorColor = {
  args: {
    ...Default.args,
    strings: ['Custom cursor color'],
    cursor: {
      text: '|',
      color: '#00ff00',
      blink: true,
      blinkSpeed: 800,
      style: CursorStyle.Blink,
      opacity: { min: 0, max: 1 },
    },
  },
};

export const CustomCursorOpacity = {
  args: {
    ...Default.args,
    strings: ['Custom cursor opacity'],
    cursor: {
      text: '|',
      opacity: { min: 0.2, max: 0.8 },
      blink: true,
      color: 'red',
      blinkSpeed: 800,
      style: CursorStyle.Blink,
    },
  },
};

export const ComplexChaining = {
  args: {
    ...Default.args,
    strings: [
      'Welcome to TypecraftFX!\n',
      "Let's explore some features:",
      '\t1. Dynamic text effects',
      '\t2. Multiple cursor styles',
      '\t3. Customizable cursor',
      '\t4. RTL support',
      '\t\tEnjoy using TypecraftFX!',
    ],
    pauseFor: 500,
    loop: false,
  },
};

export const DynamicSpeedChange = {
  args: {
    ...Default.args,
    strings: [
      'This is typed at normal speed. ',
      'This is typed very fast! ',
      'This is typed very slowly.',
    ],
    onInit: (instance: TypecraftEngine) => {
      instance.on('typeStart', (currentString: string) => {
        console.log(`Started typing: ${currentString}`);
      });
    },
  },
};

export const MixedHTMLAndPlainText = {
  args: {
    ...Default.args,
    strings: [
      'This is plain text',
      'This is <strong>bold</strong> and <em>italic</em>',
      'Back to plain text',
    ],
    html: true,
  },
};

export const CallbackFunctions = {
  args: {
    ...Default.args,
    strings: ['This string has a callback at the end.'],
    onInit: (instance: TypecraftEngine) => {
      instance.on('complete', () => {
        console.log('Typing completed!');
        alert('Typing completed!');
      });
    },
  },
};

export const MultilineText = {
  args: {
    ...Default.args,
    strings: ['This is a multiline\ntext example.\nIt should work correctly.'],
  },
};

export const EmojisAndSpecialCharacters = {
  args: {
    ...Default.args,
    strings: ['Emojis 😊🎉🚀', '\nSpecial characters: àáâãäå', '\nSymbols: ©®™℠'],
  },
};
