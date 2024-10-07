import { StoryFn as Story, Meta } from '@storybook/react';
import { fn } from '@storybook/test';
import { TypewriterComponent, Direction, CursorStyle, TextEffect } from '../src/react/Typewriter';
import { TypewriterOptions } from '../src/core/types';
import { Typewriter } from '../src/core/Typewriter';

export default {
  title: 'Components/Typewriter',
  component: TypewriterComponent,
  argTypes: {
    options: {
      control: 'object',
    },
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
} as Meta;

interface TypewriterStoryProps {
  options?: Partial<TypewriterOptions>;
  onInit?: (typewriter: Typewriter) => void;
  onTypeStart?: () => void;
  onTypeChar?: () => void;
  onTypeComplete?: () => void;
  onDeleteStart?: () => void;
  onDeleteChar?: () => void;
  onDeleteComplete?: () => void;
  onPauseStart?: () => void;
  onPauseEnd?: () => void;
  onComplete?: () => void;
}

const Template: Story<TypewriterStoryProps> = (args) => <TypewriterComponent {...args} />;

export const Default = Template.bind({});
Default.args = {
  options: {
    strings: ['Hello, World!', 'Welcome to Typewriter'],
    autoStart: true,
    loop: true,
  },
  onInit: fn(),
};

export const CustomSpeed = Template.bind({});
CustomSpeed.args = {
  options: {
    strings: ['This is typing at a custom speed'],
    autoStart: true,
    loop: true,
    speed: 50,
  },
  onInit: fn(),
};

export const CustomDeleteSpeed = Template.bind({});
CustomDeleteSpeed.args = {
  options: {
    strings: ['This will be deleted slowly'],
    autoStart: true,
    loop: true,
    speed: {
      type: 50,
      delete: 100,
      delay: 1500, // Added the required 'delay' property
    },
  },
  onInit: fn(),
};

export const RightToLeft = Template.bind({});
RightToLeft.args = {
  options: {
    strings: ['مرحبا بالعالم', 'أهلا بكم في الطابعة'],
    autoStart: true,
    loop: true,
    direction: Direction.RTL,
  },
  onInit: fn(),
};

export const CustomCursor = Template.bind({});
CustomCursor.args = {
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
  },
  onInit: fn(),
};

export const TextEffects = Template.bind({});
TextEffects.args = {
  options: {
    strings: ['Fade in effect', 'Slide in effect', 'Rainbow effect'],
    autoStart: true,
    loop: true,
    textEffect: TextEffect.FadeIn,
  },
  onInit: fn(),
};

export const CustomPauseTime = Template.bind({});
CustomPauseTime.args = {
  options: {
    strings: ['This will pause for a longer time'],
    autoStart: true,
    loop: true,
    pauseFor: 3000,
  },
  onInit: fn(),
};

export const SpeedControl = Template.bind({});
SpeedControl.args = {
  onInit: fn((typewriter: Typewriter) => {
    typewriter
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
  }),
};

export const TypeDeleteRepeat = Template.bind({});
TypeDeleteRepeat.args = {
  onInit: fn((typewriter: Typewriter) => {
    typewriter
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
  }),
};

export const CustomHtml = Template.bind({});
CustomHtml.args = {
  options: {
    strings: [
      '<span style="color: red;">Red text</span>',
      '<strong>Bold text</strong>',
      '<em>Italic text</em>',
    ],
    autoStart: true,
    loop: true,
  },
  onInit: fn((typewriter: Typewriter) => {
    typewriter
      .typeString('<span style="color: red;">Red text</span>')
      .pauseFor(1000)
      .deleteAll()
      .typeString('<strong>Bold text</strong>')
      .pauseFor(1000)
      .deleteAll()
      .typeString('<em>Italic text</em>')
      .start();
  }),
};

export const CallbackDemo = Template.bind({});
CallbackDemo.args = {
  onInit: fn((typewriter: Typewriter) => {
    typewriter
      .typeString('This demonstrates callbacks.')
      .callFunction(() => {
        console.log('String typed out!');
      })
      .pauseFor(1000)
      .deleteAll()
      .callFunction(() => {
        console.log('All deleted!');
      })
      .start();
  }),
  onTypeStart: fn(() => console.log('Type started')),
  onTypeChar: fn(() => console.log('Character typed')),
  onTypeComplete: fn(() => console.log('Typing completed')),
  onDeleteStart: fn(() => console.log('Delete started')),
  onDeleteChar: fn(() => console.log('Character deleted')),
  onDeleteComplete: fn(() => console.log('Delete completed')),
  onPauseStart: fn(() => console.log('Pause started')),
  onPauseEnd: fn(() => console.log('Pause ended')),
  onComplete: fn(() => console.log('All operations completed')),
};

export const ChangeDirection = Template.bind({});
ChangeDirection.args = {
  onInit: fn((typewriter: Typewriter) => {
    typewriter
      .typeString('This is left-to-right')
      .pauseFor(1000)
      .deleteAll()
      .setDirection(Direction.RTL)
      .typeString('وهذا من اليمين إلى اليسار')
      .start();
  }),
};

export const ChangeCursorStyle = Template.bind({});
ChangeCursorStyle.args = {
  onInit: fn((typewriter: Typewriter) => {
    typewriter
      .typeString('Default cursor')
      .pauseFor(1000)
      .deleteAll()
      .changeCursorStyle(CursorStyle.Blink)
      .typeString('Blinking cursor')
      .pauseFor(1000)
      .deleteAll()
      .changeCursorStyle(CursorStyle.Smooth)
      .typeString('Smooth cursor')
      .start();
  }),
};

export const ChangeTextEffect = Template.bind({});
ChangeTextEffect.args = {
  onInit: fn((typewriter: Typewriter) => {
    typewriter
      .changeTextEffect(TextEffect.None)
      .typeString('No effect')
      .pauseFor(1000)
      .deleteAll()
      .changeTextEffect(TextEffect.FadeIn)
      .typeString('Fade in effect')
      .pauseFor(1000)
      .deleteAll()
      .changeTextEffect(TextEffect.SlideIn)
      .typeString('Slide in effect')
      .pauseFor(1000)
      .deleteAll()
      .changeTextEffect(TextEffect.Rainbow)
      .typeString('Rainbow effect')
      .start();
  }),
};

export const EasingFunction = Template.bind({});
EasingFunction.args = {
  onInit: fn((typewriter: Typewriter) => {
    const easeInQuad = (t: number) => t * t;
    typewriter
      .setEasingFunction(easeInQuad)
      .typeString('This text is typed with an easing function.')
      .pauseFor(1000)
      .deleteAll()
      .typeString('It starts slow and accelerates.')
      .start();
  }),
};

export const NaturalSpeed = Template.bind({});
NaturalSpeed.args = {
  options: {
    strings: ['This types at a natural, random speed'],
    autoStart: true,
    loop: true,
  },
  onInit: fn((typewriter: Typewriter) => {
    typewriter.changeEasingFunction(() => Math.random() * (150 - 50) + 50).start();
  }),
};

export const MultipleOperations = Template.bind({});
MultipleOperations.args = {
  onInit: fn((typewriter: Typewriter) => {
    typewriter
      .typeString('Hello')
      .pauseFor(1000)
      .deleteChars(2)
      .typeString('y there!')
      .pauseFor(1000)
      .deleteAll()
      .typeString('Welcome to Typewriter')
      .pauseFor(1000)
      .deleteChars(10)
      .typeString('the typing animation library!')
      .start();
  }),
};

export const LoopWithCallback = Template.bind({});
LoopWithCallback.args = {
  options: {
    strings: ['First string', 'Second string', 'Third string'],
    autoStart: true,
    loop: true,
  },
  onInit: fn((typewriter: Typewriter) => {
    typewriter.on('complete', () => {
      console.log('Loop completed');
    });
  }),
};

export const ConditionalTyping = Template.bind({});
ConditionalTyping.args = {
  onInit: fn((typewriter: Typewriter) => {
    const condition = Math.random() > 0.5;
    typewriter
      .typeString('This will always be typed.')
      .pauseFor(1000)
      .callFunction(() => {
        if (condition) {
          typewriter.typeString(' This might be typed.');
        } else {
          typewriter.typeString(' This is the alternative.');
        }
      })
      .start();
  }),
};
