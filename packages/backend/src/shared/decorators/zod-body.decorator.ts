import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ZodType } from 'zod';

export const ZodBody = (schema: ZodType) =>
  createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return schema.parse(request.body);
  })();
