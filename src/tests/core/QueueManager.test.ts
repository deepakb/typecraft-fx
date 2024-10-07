import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueueManager } from './../../core/QueueManager';
import { QueueActionType, QueueItem } from './../../core/types';

describe('QueueManager', () => {
  let queueManager: QueueManager;

  beforeEach(() => {
    queueManager = new QueueManager();
  });

  it('should add items to the queue', () => {
    const item: QueueItem = {
      type: QueueActionType.TYPE,
      payload: {},
      execute: vi.fn(),
    };
    queueManager.add(item);
    expect((queueManager as any).queue).toHaveLength(1);
    expect((queueManager as any).queue[0]).toBe(item);
  });

  it('should start running when first item is added', async () => {
    const runSpy = vi.spyOn(QueueManager.prototype as any, 'run');
    const item: QueueItem = {
      type: QueueActionType.TYPE,
      payload: {},
      execute: vi.fn(),
    };
    queueManager.add(item);
    expect(runSpy).toHaveBeenCalledTimes(1);
    await runSpy.mock.results[0].value; // Wait for the run method to complete
  });

  it('should not start running when item is added and already running', () => {
    const runSpy = vi.spyOn(QueueManager.prototype as any, 'run');
    (queueManager as any).isRunning = true;
    const item: QueueItem = {
      type: QueueActionType.TYPE,
      payload: {},
      execute: vi.fn(),
    };
    queueManager.add(item);
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('should clear the queue', () => {
    (queueManager as any).queue = [{ execute: vi.fn() }, { execute: vi.fn() }];
    (queueManager as any).isRunning = true;
    queueManager.clear();
    expect((queueManager as any).queue).toHaveLength(0);
    expect((queueManager as any).isRunning).toBe(false);
  });

  it('should execute items in the queue', async () => {
    const item1 = { execute: vi.fn().mockResolvedValue(undefined) };
    const item2 = { execute: vi.fn().mockResolvedValue(undefined) };
    (queueManager as any).queue = [item1, item2];

    await (queueManager as any).run();

    expect(item1.execute).toHaveBeenCalledTimes(1);
    expect(item2.execute).toHaveBeenCalledTimes(1);
    expect((queueManager as any).queue).toHaveLength(0);
    expect((queueManager as any).isRunning).toBe(false);
  });

  it('should handle items without execute method', async () => {
    const item1 = { execute: vi.fn().mockResolvedValue(undefined) };
    const item2 = {}; // Item without execute method
    (queueManager as any).queue = [item1, item2];

    await (queueManager as any).run();

    expect(item1.execute).toHaveBeenCalledTimes(1);
    expect((queueManager as any).queue).toHaveLength(0);
    expect((queueManager as any).isRunning).toBe(false);
  });
});
