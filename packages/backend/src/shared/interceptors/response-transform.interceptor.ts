import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  API_RESPONSE_META_KEY,
  ResponseTransformConfig,
} from '../decorators/api-response.decorator.js';
import { ApiResponse } from '../types/api-response.types.js';

/**
 * Global interceptor that transforms all responses into standardized format
 *
 * This interceptor ensures all API responses follow the structure:
 * {
 *   data: T,
 *   meta?: M,
 *   message?: string
 * }
 *
 * Configuration is done via @ApiResponse decorator on controller methods
 */
@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseTransformInterceptor.name);

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Get transformation configuration from decorator
    const config = this.reflector.get<ResponseTransformConfig>(
      API_RESPONSE_META_KEY,
      context.getHandler(),
    );

    // If no config, use default (already-wrapped)
    const transformConfig: ResponseTransformConfig = config || { type: 'already-wrapped' };

    return next.handle().pipe(
      map((response: unknown) => {
        // If response is null/undefined, return as-is
        if (response === null || response === undefined) {
          return response;
        }

        return this.transformResponse(response, transformConfig);
      }),
    );
  }

  private transformResponse(
    response: unknown,
    config: ResponseTransformConfig,
  ): ApiResponse<unknown, unknown> {
    switch (config.type) {
      case 'wrap-data':
        // Wrap entire response in data field
        return { data: response };

      case 'already-wrapped':
        // Response already has correct structure, return as-is
        return response as ApiResponse<unknown, unknown>;

      case 'extract-meta': {
        // Extract specified fields into meta, rest into data
        const { metaFields = [], dataField, messageField } = config;

        // Type guard: ensure response is an object
        if (typeof response !== 'object' || response === null) {
          return { data: response };
        }

        const responseObj = response as Record<string, unknown>;
        const meta: Record<string, unknown> = {};
        const result: ApiResponse<unknown, Record<string, unknown>> = {
          data: null, // Initialize with null, will be overwritten
        };

        // Extract meta fields
        for (const field of metaFields) {
          if (field in responseObj) {
            meta[field] = responseObj[field];
          }
        }

        // Extract message if specified
        if (messageField && messageField in responseObj) {
          const msg = responseObj[messageField];
          result.message = typeof msg === 'string' ? msg : String(msg);
        }

        // Extract data
        if (dataField) {
          // Specific field contains the data
          result.data = responseObj[dataField];
        } else {
          // All non-meta, non-message fields are data
          const excludeFields = [...metaFields];
          if (messageField) excludeFields.push(messageField);

          const data: Record<string, unknown> = {};
          for (const key in responseObj) {
            if (!excludeFields.includes(key)) {
              data[key] = responseObj[key];
            }
          }
          result.data = data;
        }

        // Add meta if not empty
        if (Object.keys(meta).length > 0) {
          result.meta = meta;
        }

        return result;
      }

      default:
        this.logger.warn(
          `Unknown response transform type: ${String((config as { type?: string }).type)}`,
        );
        return response as ApiResponse<unknown, unknown>;
    }
  }
}
