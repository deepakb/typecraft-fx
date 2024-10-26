import { EasingManager } from './EasingManager';
import { CustomEffectFunction, TextEffect } from '../../types';
import { ErrorSeverity } from '../TypecraftError';
import { ITypecraftLogger } from '../TypecraftLogger';
import { EffectFactory, BaseEffect } from '../factories/EffectFactory';
import { ErrorHandler } from '../../utils/ErrorHandler';

export interface IEffectManager {
  registerCustomEffect(name: string, effectFunction: CustomEffectFunction): void;
  applyTextEffect(
    effect: TextEffect | string,
    node: HTMLElement,
    index: number,
    speed: number,
    color?: string
  ): Promise<void>;
  applyContinuousEffect(
    node: HTMLElement,
    effect: (node: HTMLElement, progress: number) => void
  ): void;
  stopContinuousEffect(node: HTMLElement): void;
  resetEffectStyles(nodes: HTMLElement[], effect: TextEffect): void;
}

export class EffectManager implements IEffectManager {
  private continuousEffects: Map<HTMLElement, number> = new Map();
  private customEffects: Map<string, CustomEffectFunction> = new Map();
  private effectFactory: EffectFactory;

  constructor(
    easingManager: EasingManager,
    private logger: ITypecraftLogger,
    private errorHandler: ErrorHandler
  ) {
    this.effectFactory = new EffectFactory(easingManager);
  }

  public registerCustomEffect(name: string, effectFunction: CustomEffectFunction): void {
    this.validateCustomEffect(name, effectFunction);
    this.customEffects.set(name, effectFunction);
    this.logger.debug('Custom effect registered', { name });
  }

  public async applyTextEffect(
    effect: TextEffect | string,
    node: HTMLElement,
    index: number,
    speed: number,
    color?: string
  ): Promise<void> {
    this.validateNode(node);
    if (color) {
      node.style.color = color;
    }

    try {
      const effectInstance = this.getEffectInstance(effect);
      await effectInstance.apply(node, index, speed);
    } catch (error) {
      this.errorHandler.handleError(
        error,
        'Error applying text effect',
        { effect, node, index, speed, color },
        ErrorSeverity.HIGH
      );
    }
  }

  public applyContinuousEffect(
    node: HTMLElement,
    effect: (node: HTMLElement, progress: number) => void
  ): void {
    this.validateNode(node);
    this.validateEffectFunction(effect);

    const animate = (time: number) => {
      const progress = (time % 1000) / 1000; // 1-second loop
      try {
        effect(node, progress);
        this.continuousEffects.set(node, window.requestAnimationFrame(animate));
      } catch (error) {
        this.stopContinuousEffect(node);
        this.errorHandler.handleError(
          error,
          'Error in continuous effect',
          { node },
          ErrorSeverity.HIGH
        );
      }
    };
    this.continuousEffects.set(node, window.requestAnimationFrame(animate));
    this.logger.debug('Continuous effect applied', { node });
  }

  public stopContinuousEffect(node: HTMLElement): void {
    this.validateNode(node);

    const animationId = this.continuousEffects.get(node);
    if (animationId) {
      window.cancelAnimationFrame(animationId);
      this.continuousEffects.delete(node);
      this.logger.debug('Continuous effect stopped', { node });
    }
  }

  public resetEffectStyles(nodes: HTMLElement[], effect: TextEffect): void {
    this.validateNodesArray(nodes);
    this.validateTextEffect(effect);

    nodes.forEach((node) => {
      node.style.transition = '';
      node.style.transform = '';
      node.style.opacity = '';
      node.style.visibility = '';
      if (effect !== TextEffect.Rainbow) {
        node.style.color = '';
      }
    });
    this.logger.debug('Effect styles reset', { effect, nodeCount: nodes.length });
  }

  private getEffectInstance(effect: TextEffect | string): BaseEffect {
    if (typeof effect === 'string' && this.customEffects.has(effect)) {
      return this.effectFactory.createCustomEffect(this.customEffects.get(effect)!);
    }
    return this.effectFactory.createEffect(effect as TextEffect);
  }

  private validateNode(node: HTMLElement): void {
    if (!node || !(node instanceof HTMLElement)) {
      this.errorHandler.handleError(
        new Error('Invalid node'),
        'Invalid node. Must be an HTMLElement.',
        { node },
        ErrorSeverity.HIGH
      );
    }
  }

  private validateEffectFunction(effect: Function): void {
    if (typeof effect !== 'function') {
      this.errorHandler.handleError(
        new Error('Invalid effect function'),
        'Invalid effect function. Must be a function.',
        { effect },
        ErrorSeverity.HIGH
      );
    }
  }

  private validateNodesArray(nodes: HTMLElement[]): void {
    if (!Array.isArray(nodes) || !nodes.every((node) => node instanceof HTMLElement)) {
      this.errorHandler.handleError(
        new Error('Invalid nodes array'),
        'Invalid nodes. Must be an array of HTMLElements.',
        { nodes },
        ErrorSeverity.HIGH
      );
    }
  }

  private validateTextEffect(effect: TextEffect): void {
    if (!Object.values(TextEffect).includes(effect)) {
      this.errorHandler.handleError(
        new Error('Invalid text effect'),
        'Invalid effect. Must be a valid TextEffect.',
        { effect },
        ErrorSeverity.HIGH
      );
    }
  }

  private validateCustomEffect(name: string, effectFunction: CustomEffectFunction): void {
    if (!name || typeof name !== 'string') {
      this.errorHandler.handleError(
        new Error('Invalid effect name'),
        'Invalid effect name. Must be a non-empty string.',
        { name },
        ErrorSeverity.HIGH
      );
    }
    if (typeof effectFunction !== 'function') {
      this.errorHandler.handleError(
        new Error('Invalid effect function'),
        'Invalid effect function. Must be a function.',
        { effectFunction },
        ErrorSeverity.HIGH
      );
    }
  }
}
