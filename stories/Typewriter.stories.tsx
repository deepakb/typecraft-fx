import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { TypecraftComponent } from '../src/react/TypecraftComponent';
import { useTypecraft } from '../src/react/useTypecraft';
import { TypecraftEngine } from '../src/core/TypecraftEngine';
import { Direction, CursorStyle, TextEffect } from '../src/core/types';

const meta: Meta<typeof TypecraftComponent> = {
  title: 'Components/TypecraftEngine',
  component: TypecraftComponent,
  tags: ['autodocs'],
  argTypes: {
    onInit: { action: 'onInit' },
    onTypeStart: { action: 'onTypeStart' },
    onTypeChar: { action: 'onTypeChar' },
    onTypeComplete: { action: 'onTypeComplete' },
    onDeleteStart: { action: 'onDeleteStart' },
    onDeleteChar: { action: 'onDeleteChar' },
    onDeleteComplete: { action: 'onDeleteComplete' },
    onPauseStart: { action: 'onPauseStart' },
    onPauseEnd: { action: 'onPauseEnd' },
    onComplete: { action: 'onComplete' },
  },
};

export default meta;
type Story = StoryObj<typeof TypecraftComponent>;

export const Default: Story = {
  args: {
    options: {
      strings: ['Hello, World!', 'Welcome to TypecraftEngine'],
      autoStart: true,
      loop: true,
      cursor: {
        text: '|',
        color: 'black',
        blinkSpeed: 530,
        opacity: {
          min: 0,
          max: 1,
        },
        cursorStyle: CursorStyle.Blink,
      },
      pauseFor: 1500,
      direction: Direction.LTR,
      cursorStyle: CursorStyle.Solid,
      textEffect: TextEffect.None,
      speed: {
        type: 50,
        delete: 50,
        delay: 1000,
      },
      html: false,
      cursorCharacter: '|',
      cursorBlink: true,
      easingFunction: (t) => t,
    },
  },
};

export const CustomSpeed: Story = {
  args: {
    options: {
      strings: ['This is typing at a custom speed'],
      autoStart: true,
      loop: true,
      speed: 50,
      cursor: {
        text: '|',
        color: 'black',
        blinkSpeed: 530,
        opacity: {
          min: 0,
          max: 1,
        },
        cursorStyle: CursorStyle.Blink,
      },
      pauseFor: 1500,
      direction: Direction.LTR,
      cursorStyle: CursorStyle.Solid,
      textEffect: TextEffect.None,
      html: false,
      cursorCharacter: '|',
      cursorBlink: true,
      easingFunction: (t) => t,
    },
  },
};

export const CustomDeleteSpeed: Story = {
  args: {
    options: {
      strings: ['This will be deleted slowly'],
      autoStart: true,
      loop: true,
      speed: {
        type: 50,
        delete: 100,
        delay: 1500,
      },
      cursor: {
        text: '|',
        color: 'black',
        blinkSpeed: 530,
        opacity: {
          min: 0,
          max: 1,
        },
        cursorStyle: CursorStyle.Blink,
      },
      pauseFor: 1500,
      direction: Direction.LTR,
      cursorStyle: CursorStyle.Solid,
      textEffect: TextEffect.None,
      html: false,
      cursorCharacter: '|',
      cursorBlink: true,
      easingFunction: (t) => t,
    },
  },
};

export const RightToLeft: Story = {
  args: {
    options: {
      strings: ['مرحبا بالعالم', 'أهلا بكم في الطابعة'],
      autoStart: true,
      loop: true,
      direction: Direction.RTL,
      cursor: {
        text: '|',
        color: 'black',
        blinkSpeed: 530,
        opacity: {
          min: 0,
          max: 1,
        },
        cursorStyle: CursorStyle.Blink,
      },
      pauseFor: 1500,
      cursorStyle: CursorStyle.Solid,
      textEffect: TextEffect.None,
      speed: {
        type: 50,
        delete: 50,
        delay: 1000,
      },
      html: false,
      cursorCharacter: '|',
      cursorBlink: true,
      easingFunction: (t) => t,
    },
  },
};

export const CustomCursor: Story = {
  args: {
    options: {
      strings: ['Custom cursor example'],
      autoStart: true,
      loop: true,
      cursor: {
        text: '▋',
        color: 'inherit',
        blinkSpeed: 530,
        opacity: {
          min: 0,
          max: 1,
        },
        cursorStyle: CursorStyle.Smooth,
      },
      pauseFor: 1500,
      direction: Direction.LTR,
      cursorStyle: CursorStyle.Solid,
      textEffect: TextEffect.None,
      speed: {
        type: 50,
        delete: 50,
        delay: 1000,
      },
      html: false,
      cursorCharacter: '▋',
      cursorBlink: true,
      easingFunction: (t) => t,
    },
  },
};

export const TextEffects: Story = {
  args: {
    options: {
      strings: ['Fade in effect', 'Slide in effect', 'Rainbow effect'],
      autoStart: true,
      loop: true,
      textEffect: TextEffect.FadeIn,
      cursor: {
        text: '|',
        color: 'black',
        blinkSpeed: 530,
        opacity: {
          min: 0,
          max: 1,
        },
        cursorStyle: CursorStyle.Blink,
      },
      pauseFor: 1500,
      direction: Direction.LTR,
      cursorStyle: CursorStyle.Solid,
      speed: {
        type: 50,
        delete: 50,
        delay: 1000,
      },
      html: false,
      cursorCharacter: '|',
      cursorBlink: true,
      easingFunction: (t) => t,
    },
  },
};

export const CustomPauseTime: Story = {
  args: {
    options: {
      strings: ['This will pause for a longer time'],
      autoStart: true,
      loop: true,
      pauseFor: 3000,
      cursor: {
        text: '|',
        color: 'black',
        blinkSpeed: 530,
        opacity: {
          min: 0,
          max: 1,
        },
        cursorStyle: CursorStyle.Blink,
      },
      direction: Direction.LTR,
      cursorStyle: CursorStyle.Solid,
      textEffect: TextEffect.None,
      speed: {
        type: 50,
        delete: 50,
        delay: 1000,
      },
      html: false,
      cursorCharacter: '|',
      cursorBlink: true,
      easingFunction: (t) => t,
    },
  },
};

export const SpeedControl: Story = {
  args: {
    onInit: (typecraft: TypecraftEngine) => {
      action('onInit')(typecraft);
      typecraft
        .typeString('This is typing at normal speed. ')
        .pauseFor(1000)
        .typeString("Now we can't change the speed directly. ")
        .pauseFor(1000)
        .typeString('But we can add more pauses. ')
        .pauseFor(500)
        .typeString('To simulate. ')
        .pauseFor(250)
        .typeString('Different. ')
        .pauseFor(100)
        .typeString('Speeds!')
        .start();
    },
  },
};

export const TypeDeleteRepeat: Story = {
  args: {
    onInit: (typecraft: TypecraftEngine) => {
      typecraft
        .typeString('Hello, this is a typing demo.')
        .pauseFor(1000)
        .deleteAll()
        .typeString('Now we start again!')
        .pauseFor(1000)
        .deleteAll()
        .typeString('And one more time...')
        .pauseFor(1000)
        .deleteChars(10)
        .typeString('for good measure!')
        .start();
    },
  },
};

export const CustomHtml: Story = {
  args: {
    options: {
      strings: [
        '<span style="color: red;">Red text</span>',
        '<strong>Bold text</strong>',
        '<em>Italic text</em>',
      ],
      autoStart: true,
      loop: true,
      cursor: {
        text: '|',
        color: 'black',
        blinkSpeed: 750,
        opacity: {
          min: 0,
          max: 1,
        },
        cursorStyle: CursorStyle.Blink,
      },
      pauseFor: 1000,
      direction: Direction.LTR,
      cursorStyle: CursorStyle.Solid,
      textEffect: TextEffect.None,
      speed: {
        type: 50,
        delete: 50,
        delay: 1000,
      },
      html: true,
      cursorCharacter: '|',
      cursorBlink: true,
      easingFunction: (t) => t,
    },
    onInit: (typecraft: TypecraftEngine) => {
      typecraft
        .typeString('<span style="color: red;">Red text</span>')
        .pauseFor(1000)
        .deleteAll()
        .typeString('<strong>Bold text</strong>')
        .pauseFor(1000)
        .deleteAll()
        .typeString('<em>Italic text</em>')
        .start();
    },
  },
};

export const CallbackDemo: Story = {
  args: {
    onInit: (typecraft: TypecraftEngine) => {
      action('onInit')(typecraft);
      typecraft
        .typeString('This demonstrates callbacks.')
        .callFunction(() => {
          action('String typed out!')();
        })
        .pauseFor(1000)
        .deleteAll()
        .callFunction(() => {
          action('All deleted!')();
        })
        .start();
    },
    onTypeStart: action('onTypeStart'),
    onTypeChar: action('onTypeChar'),
    onTypeComplete: action('onTypeComplete'),
    onDeleteStart: action('onDeleteStart'),
    onDeleteChar: action('onDeleteChar'),
    onDeleteComplete: action('onDeleteComplete'),
    onPauseStart: action('onPauseStart'),
    onPauseEnd: action('onPauseEnd'),
    onComplete: action('onComplete'),
  },
};

const UseTypecraftHookComponent = () => {
  const { setElement } = useTypecraft({
    options: {
      strings: ['Hello, World!', 'This is a hook example.'],
      autoStart: true,
      loop: true,
    },
    onInit: (tw) => {
      action('TypecraftEngine initialized')(tw);
    },
  });

  return <div ref={setElement} style={{ fontSize: '24px', fontFamily: 'monospace' }} />;
};

export const UseTypecraftHook: Story = {
  render: () => <UseTypecraftHookComponent />,
};
