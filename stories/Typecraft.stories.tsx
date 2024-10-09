import { Meta, StoryFn as Story } from '@storybook/react';
import { TypecraftComponent, TypecraftComponentProps } from '../src/react/TypecraftComponent';
import { CursorStyle } from '../src';

export default {
  title: 'Components/TypecraftComponent',
  component: TypecraftComponent,
} as Meta;

const Template: Story<TypecraftComponentProps> = (args) => <TypecraftComponent {...args} />;

export const Default = Template.bind({});
Default.args = {
  strings: ['Hello, Typecraft!', 'Welcome to Typecraft'],
  speed: 50,
};

export const SlowTyping = Template.bind({});
SlowTyping.args = {
  strings: ['This is a slow typing example.', 'Welcome to Typecraft'],
  speed: 150,
};

export const FastTyping = Template.bind({});
FastTyping.args = {
  strings: ['This is a fast typing example!', 'Welcome to Typecraft'],
  speed: 10,
};

export const WithCustomStyle = Template.bind({});
WithCustomStyle.args = {
  strings: ['Styled Typecraft', 'Welcome to Typecraft'],
  speed: 50,
  style: {
    fontSize: '24px',
    color: 'blue',
    backgroundColor: '#f0f0f0',
    padding: '20px',
    borderRadius: '8px',
  },
};

export const WithCustomClass = Template.bind({});
WithCustomClass.args = {
  strings: ['Custom class Typecraft', 'Welcome to Typecraft'],
  speed: 50,
  className: 'custom-typecraft-class',
};

export const LongText = Template.bind({});
LongText.args = {
  strings: [
    'This is a much longer text that demonstrates how Typecraft handles multiple lines of content. It will keep typing until all the text has been displayed.',
    'Welcome to Typecraft',
  ],
  speed: 30,
};

export const WithCursor = Template.bind({});
WithCursor.args = {
  strings: ['Typing with cursor', 'Welcome to Typecraft'],
  speed: 50,
  cursor: {
    text: '|',
    color: 'black',
    blinkSpeed: 500,
    opacity: {
      min: 0,
      max: 1,
    },
    style: CursorStyle.Solid,
    blink: true,
  },
};

export const WithCustomCursor = Template.bind({});
WithCustomCursor.args = {
  strings: ['Custom cursor', 'Welcome to Typecraft'],
  speed: 50,
  cursor: {
    text: '▌',
    color: 'black',
    blinkSpeed: 500,
    opacity: {
      min: 0,
      max: 1,
    },
    style: CursorStyle.Solid,
    blink: true,
  },
};

export const WithDelay = Template.bind({});
WithDelay.args = {
  strings: ['Delayed start', 'Welcome to Typecraft'],
  speed: 50,
  pauseFor: 2000,
};

export const WithLoop = Template.bind({});
WithLoop.args = {
  strings: ['Looping text', 'Welcome to Typecraft'],
  speed: 50,
  loop: true,
  pauseFor: 1000,
};
