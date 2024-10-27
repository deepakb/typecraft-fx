import { EasingManager } from './EasingManager';
import { CustomEffectFunction, TextEffect } from '../../types';
import { TypecraftError, ErrorCode, ErrorSeverity } from '../error/TypecraftError';
import { logger } from '../logging/TypecraftLogger';
import { EffectFactory, BaseEffect } from '../factories/EffectFactory';

export class EffectManager {
  private continuousEffects: Map<HTMLElement, number> = new Map();
  private customEffects: Map<string, CustomEffectFunction> = new Map();
  private effectFactory: EffectFactory;

  constructor(easingManager: EasingManager) {
    this.effectFactory = new EffectFactory(easingManager);
  }

  public registerCustomEffect(name: string, effectFunction: CustomEffectFunction): void {
    this.validateCustomEffect(name, effectFunction);
    this.customEffects.set(name, effectFunction);
    logger.debug('Custom effect registered', { name });
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
      this.handleError(error, 'Error applying text effect', { effect });
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
        this.handleError(error, 'Error in continuous effect', { node });
      }
    };
    this.continuousEffects.set(node, window.requestAnimationFrame(animate));
    logger.debug('Continuous effect applied', { node });
  }

  public stopContinuousEffect(node: HTMLElement): void {
    this.validateNode(node);

    const animationId = this.continuousEffects.get(node);
    if (animationId) {
      window.cancelAnimationFrame(animationId);
      this.continuousEffects.delete(node);
      logger.debug('Continuous effect stopped', { node });
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
    logger.debug('Effect styles reset', { effect, nodeCount: nodes.length });
  }

  private getEffectInstance(effect: TextEffect | string): BaseEffect {
    if (typeof effect === 'string' && this.customEffects.has(effect)) {
      return this.effectFactory.createCustomEffect(this.customEffects.get(effect)!);
    }
    return this.effectFactory.createEffect(effect as TextEffect);
  }

  private validateNode(node: HTMLElement): void {
    if (!node || !(node instanceof HTMLElement)) {
      throw new TypecraftError(
        ErrorCode.INVALID_ELEMENT,
        'Invalid node. Must be an HTMLElement.',
        ErrorSeverity.HIGH,
        { node }
      );
    }
  }

  private validateEffectFunction(effect: Function): void {
    if (typeof effect !== 'function') {
      throw new TypecraftError(
        ErrorCode.INVALID_OPTIONS,
        'Invalid effect function. Must be a function.',
        ErrorSeverity.HIGH,
        { effect }
      );
    }
  }

  private validateNodesArray(nodes: HTMLElement[]): void {
    if (!Array.isArray(nodes) || !nodes.every((node) => node instanceof HTMLElement)) {
      throw new TypecraftError(
        ErrorCode.INVALID_INPUT,
        'Invalid nodes. Must be an array of HTMLElements.',
        ErrorSeverity.HIGH,
        { nodes }
      );
    }
  }

  private validateTextEffect(effect: TextEffect): void {
    if (!Object.values(TextEffect).includes(effect)) {
      throw new TypecraftError(
        ErrorCode.INVALID_OPTIONS,
        'Invalid effect. Must be a valid TextEffect.',
        ErrorSeverity.HIGH,
        { effect }
      );
    }
  }

  private validateCustomEffect(name: string, effectFunction: CustomEffectFunction): void {
    if (!name || typeof name !== 'string') {
      throw new TypecraftError(
        ErrorCode.INVALID_OPTIONS,
        'Invalid effect name. Must be a non-empty string.',
        ErrorSeverity.HIGH,
        { name }
      );
    }
    if (typeof effectFunction !== 'function') {
      throw new TypecraftError(
        ErrorCode.INVALID_OPTIONS,
        'Invalid effect function. Must be a function.',
        ErrorSeverity.HIGH,
        { effectFunction }
      );
    }
  }

  private handleError(error: unknown, message: string, context: object = {}): never {
    logger.error(ErrorCode.RUNTIME_ERROR, message, { error, ...context });
    throw new TypecraftError(ErrorCode.RUNTIME_ERROR, message, ErrorSeverity.HIGH, {
      error,
      ...context,
    });
  }
}
