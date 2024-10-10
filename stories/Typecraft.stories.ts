import { Meta, StoryObj } from '@storybook/react';
import { TypecraftComponent, Direction, CursorStyle, TextEffect } from '../src';

const meta: Meta<typeof TypecraftComponent> = {
  title: 'TypecraftEngine',
  component: TypecraftComponent,
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
    onInit: { action: 'initialized' },
  },
};

export default meta;
type Story = StoryObj<typeof TypecraftComponent>;

export const BasicUsage: Story = {
  args: {
    strings: ['Welcome to TypecraftFX', 'A powerful typing animation library'],
    speed: { type: 50, delete: 50, delay: 1000 },
    loop: false,
    autoStart: true,
  },
};

export const LoopingText: Story = {
  args: {
    strings: ['First string', 'Second string', 'Third string'],
    speed: { type: 50, delete: 50, delay: 1000 },
    loop: true,
    autoStart: true,
    pauseFor: 1000,
  },
};

export const CustomCursor: Story = {
  args: {
    strings: ['Custom cursor example'],
    speed: { type: 50, delete: 50, delay: 1000 },
    autoStart: true,
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

export const RTLText: Story = {
  args: {
    strings: ['مرحبا بكم في TypecraftFX', 'مكتبة رسوم متحركة قوية للكتابة'],
    speed: { type: 50, delete: 50, delay: 1000 },
    autoStart: true,
    direction: Direction.RTL,
  },
};

export const HTMLContent: Story = {
  args: {
    strings: [
      'Welcome to <strong>TypecraftFX</strong>',
      'Supports <em>HTML</em> content',
      '<span style="color: blue;">Colored text</span>',
    ],
    speed: { type: 50, delete: 50, delay: 1000 },
    autoStart: true,
    html: true,
  },
};

export const TextEffectFadeIn: Story = {
  args: {
    strings: ['This text fades in'],
    speed: { type: 50, delete: 50, delay: 1000 },
    autoStart: true,
    textEffect: TextEffect.FadeIn,
  },
};

export const TextEffectSlideIn: Story = {
  args: {
    strings: ['This text slides in'],
    speed: { type: 50, delete: 50, delay: 1000 },
    autoStart: true,
    textEffect: TextEffect.SlideIn,
  },
};

export const TextEffectGlitch: Story = {
  args: {
    strings: ['This text has a glitch effect'],
    speed: { type: 50, delete: 50, delay: 1000 },
    autoStart: true,
    textEffect: TextEffect.Glitch,
  },
};

export const DifferentSpeeds: Story = {
  args: {
    strings: ['Fast typing', 'Slow typing', 'Normal speed'],
    speed: { type: 10, delete: 5, delay: 500 },
    autoStart: true,
  },
};

export const LongPauseBetweenStrings: Story = {
  args: {
    strings: ['First string', 'Long pause', 'Third string'],
    speed: { type: 50, delete: 50, delay: 1000 },
    autoStart: true,
    pauseFor: 3000,
  },
};

export const NoAutoStart: Story = {
  args: {
    strings: ["This won't start automatically", 'You need to call .start()'],
    speed: { type: 50, delete: 50, delay: 1000 },
    autoStart: false,
  },
};

export const CursorStyleSolid: Story = {
  args: {
    strings: ['Solid cursor style'],
    speed: { type: 50, delete: 50, delay: 1000 },
    autoStart: true,
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

export const CursorStyleBlink: Story = {
  args: {
    strings: ['Blinking cursor style'],
    speed: { type: 50, delete: 50, delay: 1000 },
    autoStart: true,
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

export const CursorStyleSmooth: Story = {
  args: {
    strings: ['Smooth cursor style'],
    speed: { type: 50, delete: 50, delay: 1000 },
    autoStart: true,
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

export const CustomCursorColor: Story = {
  args: {
    strings: ['Custom cursor color'],
    speed: { type: 50, delete: 50, delay: 1000 },
    autoStart: true,
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

export const CustomCursorOpacity: Story = {
  args: {
    strings: ['Custom cursor opacity'],
    speed: { type: 50, delete: 50, delay: 1000 },
    autoStart: true,
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

export const ComplexChaining: Story = {
  args: {
    onInit: (typecraft) => {
      typecraft
        .typeString('Welcome to TypecraftFX!')
        .pauseFor(1000)
        .deleteAll()
        .typeString("Let's explore some features:")
        .pauseFor(500)
        .typeString('\n1. Dynamic text effects')
        .pauseFor(500)
        .typeString('\n2. Multiple cursor styles')
        .pauseFor(500)
        .typeString('\n3. Customizable cursor')
        .pauseFor(500)
        .typeString('\n4. RTL support')
        .pauseFor(500)
        .deleteAll()
        .typeString('Enjoy using TypecraftFX!')
        .start();
    },
  },
};

export const DynamicSpeedChange: Story = {
  args: {
    onInit: (typecraft) => {
      typecraft
        .typeString('This is typed at normal speed. ')
        .changeTypeSpeed(10)
        .typeString('This is typed very fast! ')
        .changeTypeSpeed(200)
        .typeString('This is typed very slowly.')
        .start();
    },
  },
};

export const MixedHTMLAndPlainText: Story = {
  args: {
    strings: [
      'This is plain text',
      'This is <strong>bold</strong> and <em>italic</em>',
      'Back to plain text',
    ],
    speed: { type: 50, delete: 50, delay: 1000 },
    autoStart: true,
    html: true,
  },
};

export const CallbackFunctions: Story = {
  args: {
    onInit: (typecraft) => {
      typecraft
        .typeString('This string has a callback at the end.')
        .callFunction(() => {
          console.log('Typing completed!');
          alert('Typing completed!');
        })
        .start();
    },
  },
};

export const MultilineText: Story = {
  args: {
    strings: ['This is a multiline\ntext example.\nIt should work correctly.'],
    speed: { type: 50, delete: 50, delay: 1000 },
    autoStart: true,
  },
};

export const EmojisAndSpecialCharacters: Story = {
  args: {
    strings: ['Emojis 😊🎉🚀', 'Special characters: àáâãäå', 'Symbols: ©®™℠'],
    speed: { type: 50, delete: 50, delay: 1000 },
    autoStart: true,
  },
};

// The Documentation component will be added here later
