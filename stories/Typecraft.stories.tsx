import React from 'react';
import {
  TypecraftFX as TypecraftFXImport,
  Direction,
  CursorStyle,
  TextEffect,
  TypecraftEngine,
} from '../src';
import { Meta, StoryObj } from '@storybook/react';

const TypecraftFX = React.lazy(TypecraftFXImport);

const TypecraftFXWrapper = (props: React.ComponentProps<typeof TypecraftFX>) => (
  <React.Suspense fallback={<div>Loading...</div>}>
    <TypecraftFX {...props} />
  </React.Suspense>
);

const meta: Meta<typeof TypecraftFXWrapper> = {
  component: TypecraftFXWrapper,
  title: 'TypecraftFX',
  tags: ['autodocs'],
  excludeStories: /.*Data$/,
  argTypes: {
    strings: { control: 'object' },
    speed: {
      control: { type: 'object' },
      description: 'Typing speed configuration',
    },
    loop: { control: 'boolean' },
    autoStart: { control: 'boolean' },
    pauseFor: { control: 'number' },
    direction: { control: { type: 'select', options: Object.values(Direction) } },
    textEffect: { control: { type: 'select', options: Object.values(TextEffect) } },
    html: { control: 'boolean' },
    cursor: {
      control: 'object',
      description: 'Cursor configuration',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TypecraftFXWrapper>;

export const Default: Story = {
  args: {
    strings: ['Welcome to TypecraftFX', 'A powerful typing animation library'],
    speed: { type: 50, delete: 50, delay: 1000 },
    loop: false,
    autoStart: true,
  },
};

export const LoopingTextWithPauseAndDelete: Story = {
  args: {
    ...Default.args,
    strings: ['Hello, world!', 'This is a looping text', 'Goodbye, world!'],
    loop: true,
    pauseFor: 1000,
  },
};

export const LoopingTextWithFixed: Story = {
  args: {
    ...Default.args,
    strings: ['Hello, ', 'World!', 'Universe!', 'Galaxy!'],
    fixedStringsIndexes: [0],
    loop: true,
    pauseFor: 1000,
  },
};

// export const DeleteCharsTest: Story = {
//   args: {
//     ...Default.args,
//     strings: [],
//     speed: { type: 50, delete: 30, delay: 1000 },
//     loop: false,
//     autoStart: false,
//     onInit: (instance: TypecraftEngine) => {
//       instance
//         .typeString('The quick brown fox')
//         .pauseFor(1000)
//         .deleteChars(9)
//         .pauseFor(500)
//         .typeString(' jumps over the lazy dog')
//         .start();
//     },
//   },
// };

// export const CustomCursor: Story = {
//   args: {
//     ...Default.args,
//     strings: ['Custom cursor example'],
//     cursor: {
//       text: '_',
//       color: 'red',
//       blinkSpeed: 800,
//       style: CursorStyle.Blink,
//       blink: true,
//       opacity: { min: 0, max: 1 },
//     },
//   },
// };

// export const RTLText: Story = {
//   args: {
//     ...Default.args,
//     strings: ['مرحبا بكم في TypecraftFX', 'مكتبة رسوم متحركة قوية للكتابة'],
//     direction: Direction.RTL,
//   },
// };

// export const HTMLContent: Story = {
//   args: {
//     ...Default.args,
//     strings: [
//       'Welcome to <strong>TypecraftFX</strong>',
//       'Supports <em>HTML</em> content',
//       '<span style="color: blue;">Colored text</span>',
//     ],
//     html: true,
//   },
// };

// export const TextEffectFadeIn: Story = {
//   args: {
//     ...Default.args,
//     strings: ['This text fades in'],
//     textEffect: TextEffect.FadeIn,
//   },
// };

// export const TextEffectSlideIn: Story = {
//   args: {
//     ...Default.args,
//     strings: ['This text slides in'],
//     textEffect: TextEffect.SlideIn,
//   },
// };

// export const TextEffectGlitch: Story = {
//   args: {
//     ...Default.args,
//     strings: ['This text has a glitch effect'],
//     textEffect: TextEffect.Glitch,
//   },
// };

// export const TextEffectTypecraft: Story = {
//   args: {
//     ...Default.args,
//     strings: ['Typecraft effect in action'],
//     textEffect: TextEffect.Typecraft,
//   },
// };

// export const TextEffectRainbow: Story = {
//   args: {
//     ...Default.args,
//     strings: ['Rainbow colored text'],
//     textEffect: TextEffect.Rainbow,
//   },
// };

// export const TextEffectContinuous: Story = {
//   args: {
//     ...Default.args,
//     strings: ['Continuous colored text'],
//     textEffect: TextEffect.Continuous,
//   },
// };

// export const DifferentSpeeds: Story = {
//   args: {
//     ...Default.args,
//     strings: ['Fast typing', 'Slow typing', 'Normal speed'],
//     speed: { type: 10, delete: 5, delay: 500 },
//   },
// };

// export const LongPauseBetweenStrings: Story = {
//   args: {
//     ...Default.args,
//     strings: ['First string', 'Long pause', 'Third string'],
//     pauseFor: 3000,
//   },
// };

// export const NoAutoStart: Story = {
//   args: {
//     ...Default.args,
//     strings: ["This won't start automatically", 'You need to call .start()'],
//     autoStart: false,
//   },
// };

// export const CursorStyleSolid: Story = {
//   args: {
//     ...Default.args,
//     strings: ['Solid cursor style'],
//     cursor: {
//       style: CursorStyle.Solid,
//       blink: false,
//       text: '_',
//       color: 'red',
//       blinkSpeed: 800,
//       opacity: { min: 0, max: 1 },
//     },
//   },
// };

// export const CursorStyleBlink: Story = {
//   args: {
//     ...Default.args,
//     strings: ['Blinking cursor style'],
//     cursor: {
//       style: CursorStyle.Blink,
//       blink: true,
//       blinkSpeed: 500,
//       text: '_',
//       color: 'red',
//       opacity: { min: 0, max: 1 },
//     },
//   },
// };

// export const CursorStyleSmooth: Story = {
//   args: {
//     ...Default.args,
//     strings: ['Smooth cursor style'],
//     cursor: {
//       style: CursorStyle.Smooth,
//       blink: true,
//       blinkSpeed: 500,
//       text: '_',
//       color: 'red',
//       opacity: { min: 0, max: 1 },
//     },
//   },
// };

// export const CustomCursorColor: Story = {
//   args: {
//     ...Default.args,
//     strings: ['Custom cursor color'],
//     cursor: {
//       text: '|',
//       color: '#00ff00',
//       blink: true,
//       blinkSpeed: 800,
//       style: CursorStyle.Blink,
//       opacity: { min: 0, max: 1 },
//     },
//   },
// };

// export const CustomCursorOpacity: Story = {
//   args: {
//     ...Default.args,
//     strings: ['Custom cursor opacity'],
//     cursor: {
//       text: '|',
//       opacity: { min: 0.2, max: 0.8 },
//       blink: true,
//       color: 'red',
//       blinkSpeed: 800,
//       style: CursorStyle.Blink,
//     },
//   },
// };

// export const ComplexChaining: Story = {
//   args: {
//     ...Default.args,
//     strings: [
//       'Welcome to TypecraftFX!\n',
//       "Let's explore some features:",
//       '\t1. Dynamic text effects',
//       '\t2. Multiple cursor styles',
//       '\t3. Customizable cursor',
//       '\t4. RTL support',
//       '\t\tEnjoy using TypecraftFX!',
//     ],
//     pauseFor: 500,
//     loop: false,
//   },
// };

// export const DynamicSpeedChange: Story = {
//   args: {
//     ...Default.args,
//     strings: [
//       'This is typed at normal speed. ',
//       'This is typed very fast! ',
//       'This is typed very slowly.',
//     ],
//     onInit: (instance: TypecraftEngine) => {
//       instance.on('typeStart', (currentString: string) => {
//         console.log(`Started typing: ${currentString}`);
//       });
//     },
//   },
// };

// export const MixedHTMLAndPlainText: Story = {
//   args: {
//     ...Default.args,
//     strings: [
//       'This is plain text',
//       'This is <strong>bold</strong> and <em>italic</em>',
//       'Back to plain text',
//     ],
//     html: true,
//   },
// };

// export const CallbackFunctions: Story = {
//   args: {
//     ...Default.args,
//     strings: ['This string has a callback at the end.'],
//     onInit: (instance: TypecraftEngine) => {
//       instance.on('complete', () => {
//         console.log('Typing completed!');
//       });
//     },
//   },
// };

// export const MultilineText: Story = {
//   args: {
//     ...Default.args,
//     strings: ['This is a multiline\ntext example.\nIt should work correctly.'],
//   },
// };

// export const EmojisAndSpecialCharacters: Story = {
//   args: {
//     ...Default.args,
//     strings: ['Emojis 😊🎉🚀', '\nSpecial characters: àáâãäå', '\nSymbols: ©®™℠'],
//   },
// };

// export const DynamicWordReplacement: Story = {
//   args: {
//     ...Default.args,
//     strings: [],
//     speed: { type: 50, delete: 30, delay: 1000 },
//     loop: false,
//     onInit: (instance: TypecraftEngine) => {
//       const words = ['sunny', 'rainy', 'cloudy'];
//       instance
//         .typeString(`The weather today is ${words[0]}`)
//         .pauseFor(1000)
//         .deleteChars(words[0].length)
//         .typeString(`${words[1]}`)
//         .pauseFor(2000)
//         .deleteChars(words[1].length)
//         .typeString(`${words[2]}`)
//         .pauseFor(2000)
//         .start();

//       instance.on('wordReplaceStart', (word) => {
//         console.log(`Started replacing with: ${word}`);
//       });

//       instance.on('wordReplaceEnd', (word) => {
//         console.log(`Finished replacing with: ${word}`);
//       });
//     },
//   },
// };
