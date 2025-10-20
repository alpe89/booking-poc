import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

export const ZodParam = (schema: ZodSchema, paramName: string) =>
  createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const paramValue = request.params[paramName];

    try {
      return schema.parse(paramValue);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          error: 'Validation error',
          message: `Invalid ${paramName}: ${error.errors.map((e) => e.message).join(', ')}`,
          details: error.errors,
        });
      }
      throw error;
    }
  })();
