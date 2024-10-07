# Text Typewriter

A powerful and flexible typewriter effect library for React applications.

## Introduction

Text Typewriter is a feature-rich library that brings dynamic typing animations to your React projects. It offers a wide range of customization options, including various text effects, cursor styles, and typing speeds. Whether you're creating an interactive landing page, a creative portfolio, or just want to add some flair to your text content, Text Typewriter has you covered.

## Features

- **Dynamic Typing**: Simulate realistic typing with customizable speed and delays.
- **Text Effects**: Choose from various text effects including fade-in, slide-in, and rainbow.
- **Cursor Customization**: Customize cursor style, color, and blinking behavior.
- **Bi-directional Support**: Support for both left-to-right (LTR) and right-to-left (RTL) text.
- **Flexible API**: Easy-to-use API for chaining multiple typing actions.
- **React Integration**: Seamless integration with React applications.
- **Lazy Loading**: Option for lazy loading to improve performance.
- **TypeScript Support**: Full TypeScript support for type safety and better developer experience.
- **Customizable Callbacks**: Hook into various events during the typing process.
- **Pause and Resume**: Ability to pause and resume typing animations.
- **Loop Functionality**: Option to loop through typing sequences.

## Installation

You can install Text Typewriter using npm:

```bash
npm install text-typewriter
```

For those who prefer to use a CDN, you can include the following script tag in your HTML file:

```html
<script src="https://unpkg.com/text-typewriter/dist/text-typewriter.min.js"></script>
```

Note: Replace `@latest` with a specific version number if you want to use a particular version of the library.

## Usage

### Basic Usage with React

```jsx
import React from 'react';
import { TypewriterComponent } from 'text-typewriter';

const MyComponent = () => {
  return (
    <TypewriterComponent
      onInit={(typewriter) => {
        typewriter
          .typeString('Hello World!')
          .pauseFor(2000)
          .deleteAll()
          .typeString('Welcome to Text Typewriter')
          .start();
      }}
    />
  );
};

export default MyComponent;
```

### Advanced Usage with Custom Options

```jsx
import React from 'react';
import { TypewriterComponent, TextEffect, CursorStyle } from 'text-typewriter';

const AdvancedComponent = () => {
  return (
    <TypewriterComponent
      options={{
        strings: ['First sentence.', 'Second sentence.'],
        autoStart: true,
        loop: true,
        deleteSpeed: 50,
        delay: 100,
      }}
      onInit={(typewriter) => {
        typewriter
          .changeTextEffect(TextEffect.FadeIn)
          .typeString('This text will fade in.')
          .pauseFor(1000)
          .deleteAll()
          .changeCursorStyle(CursorStyle.Blink)
          .typeString('Blinking cursor!')
          .start();
      }}
    />
  );
};

export default AdvancedComponent;
```

### Usage with Vanilla JavaScript

If you're not using React, you can still use Text Typewriter with vanilla JavaScript:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Text Typewriter Demo</title>
    <script src="https://unpkg.com/text-typewriter@latest/dist/text-typewriter.umd.js"></script>
  </head>
  <body>
    <div id="typewriter"></div>

    <script>
      document.addEventListener('DOMContentLoaded', function () {
        const element = document.getElementById('typewriter');
        const typewriter = new Typewriter(element, {
          loop: true,
          delay: 75,
        });

        typewriter
          .typeString('Hello World!')
          .pauseFor(1000)
          .deleteAll()
          .typeString('Welcome to Text Typewriter')
          .pauseFor(1000)
          .start();
      });
    </script>
  </body>
</html>
```

## API Reference

### TypewriterComponent Props

| Prop               | Type                               | Description                                              |
| ------------------ | ---------------------------------- | -------------------------------------------------------- |
| `onInit`           | `(typewriter: Typewriter) => void` | Callback function that receives the Typewriter instance. |
| `options`          | `Partial<TypewriterOptions>`       | Configuration options for the Typewriter.                |
| `onTypeStart`      | `EventCallback`                    | Callback fired when typing starts.                       |
| `onTypeChar`       | `EventCallback`                    | Callback fired when a character is typed.                |
| `onTypeComplete`   | `EventCallback`                    | Callback fired when typing is complete.                  |
| `onDeleteStart`    | `EventCallback`                    | Callback fired when deletion starts.                     |
| `onDeleteChar`     | `EventCallback`                    | Callback fired when a character is deleted.              |
| `onDeleteComplete` | `EventCallback`                    | Callback fired when deletion is complete.                |
| `onPauseStart`     | `EventCallback`                    | Callback fired when a pause starts.                      |
| `onPauseEnd`       | `EventCallback`                    | Callback fired when a pause ends.                        |
| `onComplete`       | `EventCallback`                    | Callback fired when all actions are complete.            |

### Typewriter Methods

| Method                     | Description                                      |
| -------------------------- | ------------------------------------------------ |
| `typeString(string)`       | Types out the given string.                      |
| `deleteChars(number)`      | Deletes the specified number of characters.      |
| `deleteAll()`              | Deletes all characters.                          |
| `pauseFor(ms)`             | Pauses for the specified number of milliseconds. |
| `start()`                  | Starts the typewriter effect.                    |
| `stop()`                   | Stops the typewriter effect.                     |
| `changeCursorStyle(style)` | Changes the cursor style.                        |
| `changeTextEffect(effect)` | Changes the text effect.                         |

### TypewriterOptions

| Option        | Type                     | Default                          | Description                                     |
| ------------- | ------------------------ | -------------------------------- | ----------------------------------------------- |
| `strings`     | `string[]`               | `[]`                             | Array of strings to type out.                   |
| `autoStart`   | `boolean`                | `false`                          | Whether to start typing automatically.          |
| `loop`        | `boolean`                | `false`                          | Whether to loop the typing sequence.            |
| `deleteSpeed` | `number`                 | `50`                             | Speed of deletion in milliseconds.              |
| `delay`       | `number`                 | `1500`                           | Delay between typing sequences in milliseconds. |
| `cursor`      | `Partial<CursorOptions>` | `{ text: '\|', color: 'black' }` | Cursor options.                                 |
| `cursorStyle` | `CursorStyle`            | `CursorStyle.Solid`              | Style of the cursor.                            |
| `textEffect`  | `TextEffect`             | `TextEffect.None`                | Text effect to apply.                           |

### Development Setup

To set up the project for development:

1. Clone the repository
2. Install dependencies with `npm install`
3. Run tests with `npm test`
4. Start the development server with `npm run dev`

## License

Text Typewriter is open-source software licensed under the MIT license. See the [LICENSE](LICENSE) file for more details.

## Support

If you encounter any issues or have questions, please file an issue on the [GitHub issue tracker](https://github.com/yourusername/text-typewriter/issues).ibraries.
