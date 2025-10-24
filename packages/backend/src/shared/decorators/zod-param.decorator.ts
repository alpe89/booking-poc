import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { type ZodType, ZodError } from 'zod';

export const ZodParam = <T>(schema: ZodType<T>, paramName: string) =>
  createParamDecorator((_data: unknown, ctx: ExecutionContext): T => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const paramValue = request.params[paramName];

    try {
      return schema.parse(paramValue);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          error: 'Validation error',
          message: `Invalid ${paramName}: ${error.issues.map((e) => e.message).join(', ')}`,
          details: error.issues,
        });
      }
      throw error;
    }
  })();
