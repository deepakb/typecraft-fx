# TypecraftFX

A powerful and flexible typecraft effect library for React applications.

## Introduction

TypecraftFX is a feature-rich library that brings dynamic typing animations to your web projects. It offers seamless integration with React applications and can also be used with vanilla JavaScript. The library provides a wide range of customization options, including various text effects, cursor styles, and typing speeds. Whether you're creating an interactive landing page, a creative portfolio, or just want to add some flair to your text content, TypecraftFX has you covered.

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

You can install TypecraftFX using npm:

```bash
npm install typecraft-fx
```

For those who prefer to use a CDN, you can include the following script tag in your HTML file:

```html
<script src="https://unpkg.com/typecraft-fx/dist/typecraft-fx.min.js"></script>
```

Note: Replace `@latest` with a specific version number if you want to use a particular version of the library.

## Usage

### Basic Usage with React

### Eager Loading (smaller bundle, no code splitting)

```jsx
import { Typecraft } from 'typecraft-fx';
```

### Lazy Loading (larger initial bundle, but with code splitting)

```jsx
import { TypecraftFX } from 'typecraft-fx';
```

```jsx
import React from 'react';
import { TypecraftFX } from 'typecraft-fx';

const MyComponent = () => {
  return (
    <TypecraftFX
      onInit={(typecraft) => {
        typecraft
          .typeString('Hello World!')
          .pauseFor(2000)
          .deleteAll()
          .typeString('Welcome to TypecraftFX')
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
import { TypecraftFX, TextEffect, CursorStyle } from 'typecraft-fx';

const AdvancedComponent = () => {
  return (
    <TypecraftFX
      options={{
        strings: ['First sentence.', 'Second sentence.'],
        autoStart: true,
        loop: true,
        deleteSpeed: 50,
        delay: 100,
      }}
      onInit={(typecraft) => {
        typecraft
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

If you're not using React, you can still use TypecraftFX with vanilla JavaScript:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TypecraftFX Demo</title>
    <script src="https://unpkg.com/typecraft-fx@latest/dist/typecraft-fx.umd.js"></script>
  </head>
  <body>
    <div id="typecraft"></div>

    <script>
      document.addEventListener('DOMContentLoaded', function () {
        const element = document.getElementById('typecraft');
        const typecraft = new Typecraft(element, {
          loop: true,
          delay: 75,
        });

        typecraft
          .typeString('Hello World!')
          .pauseFor(1000)
          .deleteAll()
          .typeString('Welcome to TypecraftFX')
          .pauseFor(1000)
          .start();
      });
    </script>
  </body>
</html>
```

## API Reference

### TypecraftFX Props

| Prop               | Type                             | Description                                             |
| ------------------ | -------------------------------- | ------------------------------------------------------- |
| `onInit`           | `(typecraft: Typecraft) => void` | Callback function that receives the Typecraft instance. |
| `options`          | `Partial<TypecraftOptions>`      | Configuration options for the Typecraft.                |
| `onTypeStart`      | `EventCallback`                  | Callback fired when typing starts.                      |
| `onTypeChar`       | `EventCallback`                  | Callback fired when a character is typed.               |
| `onTypeComplete`   | `EventCallback`                  | Callback fired when typing is complete.                 |
| `onDeleteStart`    | `EventCallback`                  | Callback fired when deletion starts.                    |
| `onDeleteChar`     | `EventCallback`                  | Callback fired when a character is deleted.             |
| `onDeleteComplete` | `EventCallback`                  | Callback fired when deletion is complete.               |
| `onPauseStart`     | `EventCallback`                  | Callback fired when a pause starts.                     |
| `onPauseEnd`       | `EventCallback`                  | Callback fired when a pause ends.                       |
| `onComplete`       | `EventCallback`                  | Callback fired when all actions are complete.           |

### Typecraft Methods

| Method                     | Description                                      |
| -------------------------- | ------------------------------------------------ |
| `typeString(string)`       | Types out the given string.                      |
| `deleteChars(number)`      | Deletes the specified number of characters.      |
| `deleteAll()`              | Deletes all characters.                          |
| `pauseFor(ms)`             | Pauses for the specified number of milliseconds. |
| `start()`                  | Starts the typecraft effect.                     |
| `stop()`                   | Stops the typecraft effect.                      |
| `changeCursorStyle(style)` | Changes the cursor style.                        |
| `changeTextEffect(effect)` | Changes the text effect.                         |

### TypecraftOptions

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

TypecraftFX is open-source software licensed under the MIT license. See the [LICENSE](LICENSE) file for more details.

## Support

If you encounter any issues or have questions, please file an issue on the [GitHub issue tracker](https://github.com/deepakb/typecraft-fx/issues) libraries.
