import { EasingManager } from './EasingManager';
import { TypecraftOptions } from './types';

export class SpeedManager {
  private options: TypecraftOptions;

  constructor(options: TypecraftOptions) {
    this.options = options;
  }

  public changeSpeed(speed: number): void {
    if (typeof this.options.speed === 'object') {
      this.options.speed.type = speed;
      this.options.speed.delete = speed;
    } else {
      this.options.speed = speed;
    }
  }

  public changeTypeSpeed(speed: number): void {
    if (typeof this.options.speed === 'object') {
      this.options.speed.type = speed;
    } else {
      this.options.speed = { type: speed, delete: speed, delay: 1500 };
    }
  }

  public changeDeleteSpeed(speed: number): void {
    if (typeof this.options.speed === 'object') {
      this.options.speed.delete = speed;
    } else {
      this.options.speed = { type: speed, delete: speed, delay: 1500 };
    }
  }

  public changeDelaySpeed(delay: number): void {
    if (typeof this.options.speed === 'object') {
      this.options.speed.delay = delay;
    } else {
      this.options.speed = { type: 50, delete: 50, delay: delay };
    }
  }

  public getTypeSpeed(easingManager: EasingManager): number {
    const speed =
      typeof this.options.speed === 'object' ? this.options.speed.type : this.options.speed;
    if (typeof speed === 'number') {
      return easingManager.applyEasing(speed);
    } else if (speed === 'natural') {
      return Math.random() * (150 - 50) + 50;
    } else {
      return 50;
    }
  }
}
