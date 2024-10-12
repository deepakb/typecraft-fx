import { EasingManager } from './EasingManager';
import { SpeedOptions, TypecraftOptions } from './types';

export class SpeedManager {
  private options: TypecraftOptions;

  constructor(options: TypecraftOptions) {
    this.options = options;
  }

  public setSpeed(speedOptions: Partial<SpeedOptions>): void {
    if (typeof this.options.speed !== 'object') {
      this.options.speed = {
        type: this.options.speed as number,
        delete: this.options.speed as number,
        delay: 1500,
      };
    }

    const defaultSpeed = 50;
    const defaultDelay = 1500;

    this.options.speed = {
      type: speedOptions.type ?? this.options.speed.type ?? defaultSpeed,
      delete: speedOptions.delete ?? this.options.speed.delete ?? defaultSpeed,
      delay: speedOptions.delay ?? this.options.speed.delay ?? defaultDelay,
    };
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
