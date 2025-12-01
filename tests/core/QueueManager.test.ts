import { QueueManager } from '../../src/core/managers/QueueManager';
import { QueueItem, QueueActionType } from '../../src/types';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('QueueManager', () => {
  let queueManager: QueueManager;
  let sampleQueueItem: QueueItem;
  let mockLogger: any;
  let mockErrorHandler: any;

  beforeEach(() => {
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    mockErrorHandler = {
      handleError: vi.fn(),
    };
    queueManager = new QueueManager(mockLogger, mockErrorHandler);
    sampleQueueItem = { type: QueueActionType.TYPE_CHARACTER, payload: { char: 'a' } };
  });

  it('should add an item to the queue', () => {
    queueManager.add(sampleQueueItem);
    expect(queueManager.getNext()).toEqual(sampleQueueItem);
  });

  it('should return and remove the next item from the queue', () => {
    queueManager.add(sampleQueueItem);
    const nextItem = queueManager.getNext();
    expect(nextItem).toEqual(sampleQueueItem);
    expect(queueManager.getNext()).toBeUndefined();
  });

  it('should clear all items from the queue', () => {
    queueManager.add(sampleQueueItem);
    queueManager.add(sampleQueueItem);

    queueManager.clear();
    expect(queueManager.getNext()).toBeUndefined();
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
    expect(queueManager.getNext()).toBeUndefined();
  });
});
