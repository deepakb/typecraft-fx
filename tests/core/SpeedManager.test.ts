import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpeedManager } from '../../src/core/managers/SpeedManager';
import { ITypecraftLogger } from '../../src/core/logging/TypecraftLogger';
import { ErrorHandler } from '../../src/utils/ErrorHandler';

describe('SpeedManager', () => {
    let speedManager: SpeedManager;
    let logger: ITypecraftLogger;
    let errorHandler: ErrorHandler;

    const defaultSpeedOptions = {
        type: 100,
        delete: 50,
        delay: 1000,
    };

    beforeEach(() => {
        logger = {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
        } as unknown as ITypecraftLogger;

        errorHandler = {
            handleError: vi.fn(),
        } as unknown as ErrorHandler;

        speedManager = new SpeedManager(defaultSpeedOptions, logger, errorHandler);
    });

    it('should initialize with default options', () => {
        expect(speedManager.getSpeed()).toEqual(defaultSpeedOptions);
        expect(logger.debug).toHaveBeenCalledWith('SpeedManager initialized', {
            initialOptions: defaultSpeedOptions,
        });
    });

    it('should set speed using a number', () => {
        const newSpeed = 50;
        speedManager.setSpeed(newSpeed);

        const expectedOptions = {
            type: newSpeed,
            delete: newSpeed,
            delay: defaultSpeedOptions.delay,
        };

        expect(speedManager.getSpeed()).toEqual(expectedOptions);
        expect(logger.debug).toHaveBeenCalledWith('Speed options updated', {
            newSpeedOptions: expectedOptions,
        });
    });

    it('should set speed using partial options', () => {
        const newOptions = { type: 75 };
        speedManager.setSpeed(newOptions);

        const expectedOptions = {
            ...defaultSpeedOptions,
            ...newOptions,
        };

        expect(speedManager.getSpeed()).toEqual(expectedOptions);
        expect(logger.debug).toHaveBeenCalledWith('Speed options updated', {
            newSpeedOptions: expectedOptions,
        });
    });

    it('should set speed using multiple partial options', () => {
        const newOptions = { type: 75, delete: 25 };
        speedManager.setSpeed(newOptions);

        const expectedOptions = {
            ...defaultSpeedOptions,
            ...newOptions,
        };

        expect(speedManager.getSpeed()).toEqual(expectedOptions);
    });

    it('should handle errors when setting invalid speed options', () => {
        const invalidOptions = { type: -10 } as any; // Invalid type speed

        speedManager.setSpeed(invalidOptions);

        expect(errorHandler.handleError).toHaveBeenCalled();
    });
});
