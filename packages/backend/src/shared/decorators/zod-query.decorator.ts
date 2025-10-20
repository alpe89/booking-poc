import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ZodSchema } from 'zod';

export const ZodQuery = (schema: ZodSchema) =>
  createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return schema.parse(request.query);
  })();
