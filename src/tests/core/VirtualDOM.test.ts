import { VirtualDOM, VNode } from './../../core/VirtualDOM';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('VirtualDOM', () => {
  let virtualDOM: VirtualDOM;
  let mockElement: HTMLElement;

  beforeEach(() => {
    virtualDOM = new VirtualDOM();
    mockElement = document.createElement('div');
    document.body.appendChild(mockElement);
  });

  afterEach(() => {
    document.body.removeChild(mockElement);
  });

  it('addNode adds a node to the virtual DOM', () => {
    const node: VNode = { type: 'text', content: 'Hello' };
    virtualDOM.addNode(node);
    expect(virtualDOM['vdom'].length).toBe(1);
    expect(virtualDOM['vdom'][0]).toEqual(node);
  });

  it('removeLastNode removes the last node from the virtual DOM', () => {
    const node1: VNode = { type: 'text', content: 'Hello' };
    const node2: VNode = { type: 'text', content: 'World' };
    virtualDOM.addNode(node1);
    virtualDOM.addNode(node2);
    virtualDOM.removeLastNode();
    expect(virtualDOM['vdom'].length).toBe(1);
    expect(virtualDOM['vdom'][0]).toEqual(node1);
  });

  it('clear removes all nodes from the virtual DOM', () => {
    virtualDOM.addNode({ type: 'text', content: 'Hello' });
    virtualDOM.addNode({ type: 'text', content: 'World' });
    virtualDOM.clear();
    expect(virtualDOM['vdom'].length).toBe(0);
  });

  it('updateDOM renders text nodes correctly', () => {
    virtualDOM.addNode({ type: 'text', content: 'Hello' });
    virtualDOM.addNode({ type: 'text', content: 'World' });
    virtualDOM.updateDOM(mockElement);
    expect(mockElement.textContent).toBe('HelloWorld');
  });

  it('updateDOM renders element nodes correctly', () => {
    const node: VNode = {
      type: 'element',
      tag: 'div',
      children: [
        { type: 'text', content: 'Hello' },
        { type: 'element', tag: 'span', children: [{ type: 'text', content: 'World' }] },
      ],
    };
    virtualDOM.addNode(node);
    virtualDOM.updateDOM(mockElement);
    expect(mockElement.innerHTML).toBe('<div>Hello<span>World</span></div>');
  });

  it('updateDOM clears previous content', () => {
    mockElement.innerHTML = '<p>Previous content</p>';
    virtualDOM.addNode({ type: 'text', content: 'New content' });
    virtualDOM.updateDOM(mockElement);
    expect(mockElement.innerHTML).toBe('New content');
  });
});
