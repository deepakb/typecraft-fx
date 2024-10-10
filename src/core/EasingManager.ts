import { EasingFunction, TypecraftOptions } from './types';

export class EasingManager {
  private options: TypecraftOptions;
  private defaultEasing: EasingFunction = (t: number) => t;

  constructor(options: TypecraftOptions) {
    this.options = options;
  }

  public getEasing(): EasingFunction {
    return this.options.easingFunction || this.defaultEasing;
  }

  public setEasingFunction(easing: EasingFunction): void {
    this.options.easingFunction = easing;
  }

  public applyEasing(value: number): number {
    return this.getEasing()(value);
  }
}
