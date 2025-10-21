import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';

/**
 * Global exception filter to transform ZodError into BadRequestException (400)
 * This ensures that validation errors from Zod decorators return proper HTTP status codes
 */
@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ZodExceptionFilter.name);

  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Ensure exception has issues array
    if (!exception.issues || !Array.isArray(exception.issues) || exception.issues.length === 0) {
      this.logger.error('ZodError received without issues array:', exception);
      response.status(400).json({
        statusCode: 400,
        message: 'Validation failed',
        errors: [],
      });
      return;
    }

    // Transform Zod issues into a user-friendly format
    const errors = exception.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));

    // Create a descriptive message based on the first error
    const firstIssue = exception.issues[0];
    const fieldName = firstIssue.path.length > 0 ? firstIssue.path.join('.') : 'input';
    const message = `Invalid ${fieldName}: ${firstIssue.message}`;

    // Return 400 Bad Request with validation errors
    response.status(400).json({
      statusCode: 400,
      message,
      errors,
    });
  }
}
