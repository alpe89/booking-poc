import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ZodType } from 'zod';

export const ZodBody = (schema: ZodType) =>
  createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return schema.parse(request.body);
  })();
