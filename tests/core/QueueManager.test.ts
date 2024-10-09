import { QueueManager } from '../../src/core/QueueManager';
import { QueueItem, QueueActionType } from '../../src/core/types';
import { describe, it, expect, beforeEach } from 'vitest';

describe('QueueManager', () => {
  let queueManager: QueueManager;
  let sampleQueueItem: QueueItem;

  beforeEach(() => {
    queueManager = new QueueManager();
    sampleQueueItem = { type: QueueActionType.TYPE_CHARACTER, payload: { char: 'a' } };
  });

  it('should initialize with an empty queue', () => {
    expect(queueManager.isEmpty()).toBe(true);
    expect(queueManager.getLength()).toBe(0);
  });

  it('should add an item to the queue', () => {
    queueManager.add(sampleQueueItem);
    expect(queueManager.isEmpty()).toBe(false);
    expect(queueManager.getLength()).toBe(1);
  });

  it('should return and remove the next item from the queue', () => {
    queueManager.add(sampleQueueItem);
    const nextItem = queueManager.getNext();
    expect(nextItem).toEqual(sampleQueueItem);
    expect(queueManager.isEmpty()).toBe(true);
    expect(queueManager.getLength()).toBe(0);
  });

  it('should return undefined when getting next item from an empty queue', () => {
    const nextItem = queueManager.getNext();
    expect(nextItem).toBeUndefined();
  });

  it('should clear all items from the queue', () => {
    queueManager.add(sampleQueueItem);
    queueManager.add(sampleQueueItem);
    expect(queueManager.getLength()).toBe(2);

    queueManager.clear();
    expect(queueManager.isEmpty()).toBe(true);
    expect(queueManager.getLength()).toBe(0);
  });

  it('should correctly report if the queue is empty', () => {
    expect(queueManager.isEmpty()).toBe(true);
    queueManager.add(sampleQueueItem);
    expect(queueManager.isEmpty()).toBe(false);
    queueManager.getNext();
    expect(queueManager.isEmpty()).toBe(true);
  });

  it('should correctly report the length of the queue', () => {
    expect(queueManager.getLength()).toBe(0);
    queueManager.add(sampleQueueItem);
    expect(queueManager.getLength()).toBe(1);
    queueManager.add(sampleQueueItem);
    expect(queueManager.getLength()).toBe(2);
    queueManager.getNext();
    expect(queueManager.getLength()).toBe(1);
  });

  it('should maintain correct order of items in the queue', () => {
    const item1 = { type: QueueActionType.TYPE_CHARACTER, payload: { char: 'a' } };
    const item2 = { type: QueueActionType.TYPE_CHARACTER, payload: { char: 'b' } };
    const item3 = { type: QueueActionType.TYPE_CHARACTER, payload: { char: 'c' } };

    queueManager.add(item1);
    queueManager.add(item2);
    queueManager.add(item3);

    expect(queueManager.getNext()).toEqual(item1);
    expect(queueManager.getNext()).toEqual(item2);
    expect(queueManager.getNext()).toEqual(item3);
  });
});
