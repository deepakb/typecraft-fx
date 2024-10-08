import { describe, it, expect } from 'vitest';
import { QueueManager } from '../../src/core/QueueManager';
import { QueueActionType } from '../../src/core/types';

describe('QueueManager', () => {
  it('should add items to the queue', () => {
    const queueManager = new QueueManager();
    const item = {
      type: QueueActionType.TYPE,
      payload: { char: 'a' },
    };
    queueManager.add(item);
    expect(queueManager.getLength()).toBe(1);
    expect(queueManager.getNext()).toBe(item);
  });

  it('should remove items from the queue when getting next', () => {
    const queueManager = new QueueManager();
    const item1 = { type: QueueActionType.TYPE, payload: { char: 'a' } };
    const item2 = { type: QueueActionType.TYPE, payload: { char: 'b' } };
    queueManager.add(item1);
    queueManager.add(item2);
    expect(queueManager.getLength()).toBe(2);
    expect(queueManager.getNext()).toBe(item1);
    expect(queueManager.getLength()).toBe(1);
    expect(queueManager.getNext()).toBe(item2);
    expect(queueManager.getLength()).toBe(0);
  });

  it('should clear the queue', () => {
    const queueManager = new QueueManager();
    queueManager.add({ type: QueueActionType.TYPE, payload: { char: 'a' } });
    queueManager.add({ type: QueueActionType.TYPE, payload: { char: 'b' } });
    expect(queueManager.getLength()).toBe(2);
    queueManager.clear();
    expect(queueManager.getLength()).toBe(0);
  });

  it('should check if queue is empty', () => {
    const queueManager = new QueueManager();
    expect(queueManager.isEmpty()).toBe(true);
    queueManager.add({ type: QueueActionType.TYPE, payload: { char: 'a' } });
    expect(queueManager.isEmpty()).toBe(false);
  });
});
