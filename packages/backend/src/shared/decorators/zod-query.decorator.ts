import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ZodType } from 'zod';

export const ZodQuery = (schema: ZodType) =>
  createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return schema.parse(request.query);
  })();
