import { QueueManager } from './QueueManager';
import { QueueActionType } from './types';

export class StringManager {
  private queueManager: QueueManager;

  constructor(queueManager: QueueManager) {
    this.queueManager = queueManager;
  }

  public typeString(string: string): void {
    string.split('').forEach((char) => {
      this.queueManager.add({ type: QueueActionType.TYPE_CHARACTER, payload: { char } });
    });
  }

  public deleteChars(numChars: number): void {
    for (let i = 0; i < numChars; i++) {
      this.queueManager.add({ type: QueueActionType.DELETE_CHARACTER, payload: {} });
    }
  }

  public deleteAll(visibleNodesLength: number): void {
    this.deleteChars(visibleNodesLength);
  }
}
