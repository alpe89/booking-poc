import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { type ZodType } from 'zod';

export const ZodBody = <T>(schema: ZodType<T>) =>
  createParamDecorator((_data: unknown, ctx: ExecutionContext): T => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return schema.parse(request.body);
  })();
