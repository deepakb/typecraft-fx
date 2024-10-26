import { CursorManager, ICursorManager } from '../managers/CursorManager';
import { EasingManager, IEasingManager } from '../managers/EasingManager';
import { EffectManager, IEffectManager } from '../managers/EffectManager';
import { IOptionsManager, OptionsManager } from '../managers/OptionsManager';
import { IQueueManager, QueueManager } from '../managers/QueueManager';
import { ISpeedManager, SpeedManager } from '../managers/SpeedManager';
import { IStateManager, StateManager } from '../managers/StateManager';
import { IStringManager, StringManager } from '../managers/StringManager';
import { ITypecraftLogger } from '../TypecraftLogger';
import { CursorOptions, SpeedOptions, TypecraftOptions } from '../../types';
import { ErrorHandler } from '../../utils/ErrorHandler';

export interface IManagerFactory {
  createOptionsManager(element: HTMLElement, options: Partial<TypecraftOptions>): IOptionsManager;
  createStateManager(element: HTMLElement, options: TypecraftOptions): IStateManager;
  createQueueManager(): IQueueManager;
  createEasingManager(options: TypecraftOptions): IEasingManager;
  createEffectManager(easingManager: IEasingManager): IEffectManager;
  createStringManager(queueManager: IQueueManager): IStringManager;
  createSpeedManager(speedOptions: SpeedOptions): ISpeedManager;
  createCursorManager(element: HTMLElement, cursorOptions: CursorOptions): ICursorManager;
}

export class ManagerFactory implements IManagerFactory {
  private errorHandler: ErrorHandler;

  constructor(private logger: ITypecraftLogger) {
    this.errorHandler = new ErrorHandler(logger);
  }

  createOptionsManager(element: HTMLElement, options: Partial<TypecraftOptions>): IOptionsManager {
    return new OptionsManager(element, options, this.logger, this.errorHandler);
  }

  createStateManager(element: HTMLElement, options: TypecraftOptions): IStateManager {
    return new StateManager(element, options, this.logger, this.errorHandler);
  }

  createQueueManager(): IQueueManager {
    return new QueueManager(this.logger, this.errorHandler);
  }

  createEasingManager(options: TypecraftOptions): IEasingManager {
    return new EasingManager(options, this.logger, this.errorHandler);
  }

  createEffectManager(easingManager: EasingManager): IEffectManager {
    return new EffectManager(easingManager, this.logger, this.errorHandler);
  }

  createStringManager(queueManager: QueueManager): IStringManager {
    return new StringManager(queueManager, this.logger, this.errorHandler);
  }

  createSpeedManager(speedOptions: SpeedOptions): ISpeedManager {
    return new SpeedManager(speedOptions, this.logger, this.errorHandler);
  }

  createCursorManager(element: HTMLElement, cursorOptions: CursorOptions): ICursorManager {
    return new CursorManager(element, cursorOptions, this.logger, this.errorHandler);
  }
}
