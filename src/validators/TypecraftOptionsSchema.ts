import { z } from 'zod';
import { CursorStyle, Direction, TextEffect } from '../types';
import { MIN_TYPING_SPEED, MAX_TYPING_SPEED, MIN_BLINK_SPEED, MAX_BLINK_SPEED } from '../constants';

export const SpeedOptionsSchema = z.object({
  type: z.number().min(MIN_TYPING_SPEED).max(MAX_TYPING_SPEED),
  delete: z.number().min(MIN_TYPING_SPEED).max(MAX_TYPING_SPEED),
  delay: z.number().nonnegative(),
});

export const CursorOptionsSchema = z.object({
  text: z.string(),
  color: z.string(),
  blinkSpeed: z.number().min(MIN_BLINK_SPEED).max(MAX_BLINK_SPEED),
  opacity: z
    .object({
      min: z.number().min(0).max(1),
      max: z.number().min(0).max(1),
    })
    .refine((data) => data.min <= data.max, {
      message: 'Min opacity must be less than or equal to max opacity',
    }),
  style: z.nativeEnum(CursorStyle),
  blink: z.boolean(),
});

export const TypecraftOptionsSchema = z.object({
  strings: z.array(z.string()),
  speed: SpeedOptionsSchema,
  loop: z.boolean(),
  autoStart: z.boolean(),
  cursor: CursorOptionsSchema,
  pauseFor: z.number().nonnegative(),
  direction: z.nativeEnum(Direction),
  textEffect: z.nativeEnum(TextEffect),
  easingFunction: z.function().returns(z.number()),
  html: z.boolean(),
  loopLastString: z.boolean(),
});

export type TypecraftOptionsSchemaType = z.infer<typeof TypecraftOptionsSchema>;
export type CursorOptionsSchemaType = z.infer<typeof CursorOptionsSchema>;
export type SpeedOptionsSchemaType = z.infer<typeof SpeedOptionsSchema>;
