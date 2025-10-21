import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { ZodType, ZodError } from 'zod';

export const ZodParam = (schema: ZodType, paramName: string) =>
  createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
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
