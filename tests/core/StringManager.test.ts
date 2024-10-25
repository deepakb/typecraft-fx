import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StringManager } from '../../src/core/StringManager';
import { QueueManager } from '../../src/core/QueueManager';
import { QueueActionType } from '../../src/core/types';

describe('StringManager', () => {
  let stringManager: StringManager;
  let mockQueueManager: QueueManager;

  beforeEach(() => {
    mockQueueManager = {
      add: vi.fn(),
    } as unknown as QueueManager;
    stringManager = new StringManager(mockQueueManager);
  });

  describe('typeString', () => {
    it('should handle plain text when HTML is disabled', () => {
      stringManager.typeString('Hello, World!', false);
      expect(mockQueueManager.add).toHaveBeenCalledTimes(13);
      expect(mockQueueManager.add).toHaveBeenCalledWith({
        type: QueueActionType.TYPE_CHARACTER,
        payload: { char: 'H' },
      });
    });

    it('should handle HTML content when HTML is enabled', () => {
      stringManager.typeString('<p>Hello</p>', true);
      expect(mockQueueManager.add).toHaveBeenCalledWith({
        type: QueueActionType.TYPE_HTML_TAG_OPEN,
        payload: { tagName: 'p', attributes: expect.any(NamedNodeMap) },
      });
      expect(mockQueueManager.add).toHaveBeenCalledWith({
        type: QueueActionType.TYPE_HTML_CONTENT,
        payload: { content: 'Hello' },
      });
      expect(mockQueueManager.add).toHaveBeenCalledWith({
        type: QueueActionType.TYPE_HTML_TAG_CLOSE,
        payload: { tagName: 'p' },
      });
    });
  });

  describe('parseSpecialCharacters', () => {
    it('should handle newline characters', () => {
      const result = (stringManager as any).parseSpecialCharacters('Hello\nWorld');
      expect(result).toEqual(['H', 'e', 'l', 'l', 'o', '\n', 'W', 'o', 'r', 'l', 'd']);
    });

    it('should handle tab characters', () => {
      const result = (stringManager as any).parseSpecialCharacters('Hello\tWorld');
      expect(result).toEqual(['H', 'e', 'l', 'l', 'o', '\t', 'W', 'o', 'r', 'l', 'd']);
    });
  });

  describe('parseHTML', () => {
    it('should parse HTML string into nodes', () => {
      const result = (stringManager as any).parseHTML('<p>Hello <strong>World</strong></p>');
      expect(result.length).toBe(1);
      expect(result[0].nodeName).toBe('P');
      expect(result[0].childNodes.length).toBe(2);
    });
  });

  describe('typeNodes', () => {
    it('should handle text nodes', () => {
      const textNode = document.createTextNode('Hello');
      (stringManager as any).typeNodes([textNode]);
      expect(mockQueueManager.add).toHaveBeenCalledTimes(5);
    });

    it('should handle element nodes', () => {
      const element = document.createElement('p');
      element.textContent = 'Hello';
      (stringManager as any).typeNodes([element]);
      expect(mockQueueManager.add).toHaveBeenCalledWith({
        type: QueueActionType.TYPE_HTML_TAG_OPEN,
        payload: { tagName: 'p', attributes: expect.any(NamedNodeMap) },
      });
    });
  });

  describe('typeTextNode', () => {
    it('should add type character actions for each character in the text node', () => {
      const textNode = document.createTextNode('Hello');
      (stringManager as any).typeTextNode(textNode);
      expect(mockQueueManager.add).toHaveBeenCalledTimes(5);
    });
  });

  describe('typeElementNode', () => {
    it('should handle elements with single text node child', () => {
      const element = document.createElement('p');
      element.textContent = 'Hello';
      (stringManager as any).typeElementNode(element);
      expect(mockQueueManager.add).toHaveBeenCalledWith({
        type: QueueActionType.TYPE_HTML_CONTENT,
        payload: { content: 'Hello' },
      });
    });

    it('should handle elements with multiple children', () => {
      const element = document.createElement('div');
      element.innerHTML = '<p>Hello</p><span>World</span>';
      (stringManager as any).typeElementNode(element);
      expect(mockQueueManager.add).toHaveBeenCalledTimes(8);

      // Verify the specific calls
      expect(mockQueueManager.add).toHaveBeenCalledWith({
        type: QueueActionType.TYPE_HTML_TAG_OPEN,
        payload: { tagName: 'div', attributes: expect.any(NamedNodeMap) },
      });
      expect(mockQueueManager.add).toHaveBeenCalledWith({
        type: QueueActionType.TYPE_HTML_TAG_OPEN,
        payload: { tagName: 'p', attributes: expect.any(NamedNodeMap) },
      });
      expect(mockQueueManager.add).toHaveBeenCalledWith({
        type: QueueActionType.TYPE_HTML_CONTENT,
        payload: { content: 'Hello' },
      });
      expect(mockQueueManager.add).toHaveBeenCalledWith({
        type: QueueActionType.TYPE_HTML_TAG_CLOSE,
        payload: { tagName: 'p' },
      });
      expect(mockQueueManager.add).toHaveBeenCalledWith({
        type: QueueActionType.TYPE_HTML_TAG_OPEN,
        payload: { tagName: 'span', attributes: expect.any(NamedNodeMap) },
      });
      expect(mockQueueManager.add).toHaveBeenCalledWith({
        type: QueueActionType.TYPE_HTML_CONTENT,
        payload: { content: 'World' },
      });
      expect(mockQueueManager.add).toHaveBeenCalledWith({
        type: QueueActionType.TYPE_HTML_TAG_CLOSE,
        payload: { tagName: 'span' },
      });
      expect(mockQueueManager.add).toHaveBeenCalledWith({
        type: QueueActionType.TYPE_HTML_TAG_CLOSE,
        payload: { tagName: 'div' },
      });
    });
  });

  describe('deleteChars', () => {
    it('should add delete character actions to the queue', () => {
      stringManager.deleteChars(3);
      expect(mockQueueManager.add).toHaveBeenCalledTimes(3);
      expect(mockQueueManager.add).toHaveBeenCalledWith({
        type: QueueActionType.DELETE_CHARACTERS,
        payload: {},
      });
    });
  });

  describe('deleteAll', () => {
    it('should call deleteChars with the provided length', () => {
      const spy = vi.spyOn(stringManager, 'deleteChars');
      stringManager.deleteAll(5);
      expect(spy).toHaveBeenCalledWith(5);
    });
  });
});
