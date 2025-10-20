import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodType, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          error: 'Validation error',
          message: 'Invalid request data',
          details: error.issues,
        });
      }
      throw error;
    }
  }
}
