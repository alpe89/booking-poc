# Error Handling - Implementation Fixes

## Fix 1: Add Prisma Error Filter (CRITICAL)

### File: `packages/backend/src/shared/filters/prisma-error.filter.ts` (NEW)

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import {
  PrismaClientValidationError,
  PrismaClientRuntimeError,
  PrismaClientKnownRequestError,
} from '@prisma/client/runtime/library';

@Catch(
  PrismaClientValidationError,
  PrismaClientRuntimeError,
  PrismaClientKnownRequestError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An internal database error occurred';
    let errorCode: string | undefined;

    // Handle known Prisma error codes
    if (exception instanceof PrismaClientKnownRequestError) {
      switch (exception.code) {
        // Record not found
        case 'P2025':
          statusCode = HttpStatus.NOT_FOUND;
          message = 'The requested record does not exist';
          errorCode = 'RECORD_NOT_FOUND';
          break;

        // Unique constraint violation
        case 'P2002':
          statusCode = HttpStatus.CONFLICT;
          message = 'A unique constraint was violated';
          errorCode = 'UNIQUE_CONSTRAINT_VIOLATION';
          break;

        // Foreign key constraint violation
        case 'P2003':
          statusCode = HttpStatus.CONFLICT;
          message = 'A foreign key constraint was violated';
          errorCode = 'FOREIGN_KEY_CONSTRAINT_VIOLATION';
          break;

        // Record required but not found
        case 'P2018':
          statusCode = HttpStatus.NOT_FOUND;
          message = 'The required record does not exist';
          errorCode = 'REQUIRED_RECORD_NOT_FOUND';
          break;

        // Value too long
        case 'P2000':
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'The value provided is too long';
          errorCode = 'VALUE_TOO_LONG';
          break;

        default:
          this.logger.error('Unhandled Prisma error code:', exception.code);
          message = 'A database error occurred';
          errorCode = `PRISMA_${exception.code}`;
      }
    } else if (exception instanceof PrismaClientValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Invalid database query';
      errorCode = 'DATABASE_VALIDATION_ERROR';
    } else if (exception instanceof PrismaClientRuntimeError) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Database connection error';
      errorCode = 'DATABASE_CONNECTION_ERROR';

      // Log connection errors for ops team
      this.logger.error(
        'Database runtime error - possible connection issue',
        exception instanceof Error ? exception.message : String(exception),
      );
    }

    // Always log the original error
    this.logger.error('Prisma error caught:', {
      code: exception.code,
      message: exception instanceof Error ? exception.message : String(exception),
      statusCode,
    });

    response.status(statusCode).json({
      statusCode,
      message,
      error: errorCode || 'DATABASE_ERROR',
    });
  }
}
```

### Update: `packages/backend/src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ZodExceptionFilter } from './shared/filters/zod-exception.filter.js';
import { PrismaExceptionFilter } from './shared/filters/prisma-error.filter.js';  // ADD THIS

const app = await NestFactory.create(AppModule);

// Register global exception filters (order matters - first wins)
app.useGlobalFilters(
  new ZodExceptionFilter(),
  new PrismaExceptionFilter(),  // ADD THIS
);

// ... rest of configuration
```

---

## Fix 2: Enhance Frontend API Client Error Handling (CRITICAL)

### File: `packages/frontend/app/composables/useApi.ts`

```typescript
import type {
  ApiResponse,
  PaginationMeta,
  TravelDetailMeta,
  BookingReserveMeta,
  BookingDetailMeta,
  BookingConfirmMeta,
  TravelSerialized,
  BookingSerialized,
  ConfirmBookingDto,
  GetTravelsQuery,
  ReserveBookingDto,
} from '@booking/shared'

type QueryParams = Record<string, string | number | boolean | null | undefined>

type FetcherOptions = Omit<
  Parameters<typeof $fetch>[1],
  'baseURL' | 'headers' | 'query' | 'body' | 'method'
> & {
  query?: QueryParams
  body?: BodyInit | Record<string, unknown>
  headers?: HeadersInit
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
}

// Add this interface for better type safety
interface ApiErrorDetail {
  statusCode: number
  message: string
  error?: string
  errors?: Array<{
    path: string
    message: string
    code: string
  }>
}

// Custom error class with additional context
class ApiError extends Error {
  statusCode: number
  statusText?: string
  details?: ApiErrorDetail
  isNetworkError: boolean
  isValidationError: boolean
  isServerError: boolean

  constructor(message: string, statusCode: number, details?: ApiErrorDetail) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.details = details
    
    // Determine error type
    this.isNetworkError = statusCode === 0 || statusCode >= 500
    this.isValidationError = statusCode === 400 || statusCode === 422
    this.isServerError = statusCode >= 500
  }
}

export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = import.meta.server
    ? (config.apiBaseInternal ?? config.public.apiBase)
    : config.public.apiBase

  const handleRequest = async <T>(endpoint: string, options: FetcherOptions = {}): Promise<T> => {
    const { headers, ...rest } = options

    try {
      const response = await $fetch<T>(endpoint, {
        baseURL,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        ...rest,
      })
      return response
    } catch (error) {
      // Handle FetchError from h3/ofetch
      if (error instanceof Error && '$fetch' in error) {
        const fetchError = error as any
        const statusCode = fetchError.status || fetchError.statusCode || 0
        const statusText = fetchError.statusText || 'Unknown Error'
        const apiErrorDetail = fetchError.data as ApiErrorDetail

        // Create descriptive error message
        let errorMessage = apiErrorDetail?.message || apiErrorDetail?.error || statusText

        // For validation errors, include first validation issue
        if (statusCode === 400 && apiErrorDetail?.errors?.length) {
          errorMessage = apiErrorDetail.errors[0].message
        }

        const apiError = new ApiError(errorMessage, statusCode, apiErrorDetail)
        apiError.statusText = statusText

        throw apiError
      }

      // Handle network errors (connection issues)
      if (error instanceof TypeError) {
        const networkError = new ApiError('Network connection failed', 0)
        networkError.cause = error
        throw networkError
      }

      // Handle unexpected errors
      if (error instanceof Error) {
        throw error
      }

      throw new Error('An unexpected error occurred')
    }
  }

  return {
    // Travel endpoints
    travels: {
      list: (query?: GetTravelsQuery) =>
        handleRequest<ApiResponse<TravelSerialized[], PaginationMeta>>('/travels', {
          query,
        }),

      getBySlug: (slug: string) =>
        handleRequest<ApiResponse<TravelSerialized, TravelDetailMeta>>(`/travels/${slug}`),
    },

    // Booking endpoints
    bookings: {
      reserve: (data: ReserveBookingDto) =>
        handleRequest<ApiResponse<BookingSerialized, BookingReserveMeta>>('/bookings/reserve', {
          method: 'POST',
          body: data,
        }),

      getById: (id: string) =>
        handleRequest<ApiResponse<BookingSerialized, BookingDetailMeta>>(`/bookings/${id}`),

      confirm: (id: string, data: ConfirmBookingDto) =>
        handleRequest<ApiResponse<BookingSerialized, BookingConfirmMeta>>(
          `/bookings/${id}/confirm`,
          {
            method: 'POST',
            body: data,
          }
        ),

      cancel: (id: string) =>
        handleRequest<ApiResponse<BookingSerialized>>(`/bookings/${id}`, {
          method: 'DELETE',
        }),
    },
  }
}

// Helper function to get user-friendly error message
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

// Helper function to get validation errors from API response
export const getValidationErrors = (error: unknown): Record<string, string> => {
  if (error instanceof ApiError && error.details?.errors) {
    const result: Record<string, string> = {}
    error.details.errors.forEach((err) => {
      result[err.path] = err.message
    })
    return result
  }
  return {}
}

// Helper to check error type
export const isValidationError = (error: unknown): error is ApiError => {
  return error instanceof ApiError && error.isValidationError
}

export const isNetworkError = (error: unknown): error is ApiError => {
  return error instanceof ApiError && error.isNetworkError
}

export const isServerError = (error: unknown): error is ApiError => {
  return error instanceof ApiError && error.isServerError
}
```

---

## Fix 3: Add Error Handling to Cron Jobs (HIGH)

### File: `packages/backend/src/modules/booking/booking-cleanup.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@shared/prisma/prisma.service.js';
import { BookingStatus } from '@database/index.js';

@Injectable()
export class BookingCleanupService {
  private readonly logger = new Logger(BookingCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cleanup expired PENDING bookings every 6 hours
   * Runs at: 00:00, 06:00, 12:00, 18:00
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async cleanupExpiredBookings() {
    const startTime = Date.now();

    try {
      const now = new Date();

      const result = await this.prisma.booking.updateMany({
        where: {
          status: BookingStatus.PENDING,
          expiresAt: { lt: now },
        },
        data: {
          status: BookingStatus.EXPIRED,
        },
      });

      const duration = Date.now() - startTime;

      if (result.count > 0) {
        this.logger.log(
          `Successfully marked ${result.count} expired bookings as EXPIRED (took ${duration}ms)`,
        );
      } else {
        this.logger.debug(`No expired bookings to cleanup (took ${duration}ms)`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error('Failed to cleanup expired bookings', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        duration,
        timestamp: new Date().toISOString(),
      });

      // In production, you might want to:
      // 1. Send alert to ops team
      // 2. Emit metric/counter
      // 3. Store failure in database for monitoring
      // 4. Retry with exponential backoff
      
      // Example: Send to monitoring service
      // await this.monitoringService.recordCronFailure('bookingCleanup', error);
    }
  }
}
```

---

## Fix 4: Standardize Validation Decorators (HIGH)

### File: `packages/backend/src/shared/decorators/zod-query.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ZodType } from 'zod';

export const ZodQuery = <T>(schema: ZodType<T>) =>
  createParamDecorator((_data: unknown, ctx: ExecutionContext): T => {
    const request = ctx.switchToHttp().getRequest<Request>();
    // Let ZodError propagate to ZodExceptionFilter (consistent with ZodBody)
    return schema.parse(request.query);
  })();
```

### File: `packages/backend/src/shared/decorators/zod-param.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { type ZodType } from 'zod';

export const ZodParam = <T>(schema: ZodType<T>, paramName: string) =>
  createParamDecorator((_data: unknown, ctx: ExecutionContext): T => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const paramValue = request.params[paramName];

    // Let ZodError propagate to ZodExceptionFilter (consistent with ZodBody)
    return schema.parse(paramValue);
  })();
```

Now the `ZodExceptionFilter` will catch all ZodErrors from all decorators.

---

## Fix 5: Improve Component Error Handling (HIGH)

### File: `packages/frontend/app/components/booking/BookingForm.vue` (Updated)

```typescript
import { getErrorMessage, getValidationErrors, isValidationError } from '~/composables/useApi'

const handleSubmit = async (event: { data: ReserveBookingDto }) => {
  if (props.handleApiCall) {
    try {
      isSubmitting.value = true
      const response = await api.bookings.reserve(event.data)

      toast.add({
        title: 'Booking confirmed!',
        description: `Your booking expires on ${new Date(response.meta.expiresAt).toLocaleString(
          'en-US'
        )}`,
        color: 'success',
      })

      emit('success', response)
    } catch (err) {
      // Enhanced error handling
      const errorMessage = getErrorMessage(err)

      // Check if it's a validation error with field-specific errors
      if (isValidationError(err)) {
        const validationErrors = getValidationErrors(err)

        // If you have field error handling, use it
        if (Object.keys(validationErrors).length > 0) {
          // Could update form field errors here
          const errorList = Object.entries(validationErrors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(', ')

          toast.add({
            title: 'Validation failed',
            description: errorList,
            color: 'error',
          })
        } else {
          toast.add({
            title: 'Booking failed',
            description: errorMessage,
            color: 'error',
          })
        }
      } else {
        toast.add({
          title: 'Booking failed',
          description: errorMessage,
          color: 'error',
        })
      }

      const error = err instanceof Error ? err : new Error(errorMessage)
      emit('error', error)
    } finally {
      isSubmitting.value = false
    }
  } else {
    emit('submit', event.data)
  }
}
```

### File: `packages/frontend/app/pages/bookings/[id].vue` (Updated)

```typescript
import { getErrorMessage, isNetworkError } from '~/composables/useApi'

const syncWithServer = async (): Promise<number | null> => {
  try {
    const response = await api.bookings.getById(bookingId)

    // Only update if status changed
    if (response.data.status !== data.value?.data.status) {
      await refresh()
    }

    return response.meta.remainingTime
  } catch (err) {
    // Don't silently fail - handle it appropriately
    const errorMsg = getErrorMessage(err)

    // Only log network errors to console, show critical errors to user
    if (isNetworkError(err)) {
      console.warn('Network error during sync:', errorMsg)
      // Could retry after a delay
    } else {
      // Server error - log and potentially notify user
      console.error('Server error during sync:', errorMsg)
      // Could emit event or store error state
    }

    return null
  }
}

const handleConfirm = async () => {
  try {
    isProcessing.value = true
    const response = await api.bookings.confirm(bookingId, {
      paymentMethod: 'fake',
    })

    toast.add({
      title: 'Payment successful!',
      description: `Your booking has been confirmed. Transaction ID: ${response.meta.payment.transactionId}`,
      color: 'success',
    })

    await refresh()
  } catch (err) {
    // Enhanced error handling with better messages
    const errorMsg = getErrorMessage(err)

    // Check specific error types
    if (err instanceof Error && 'statusCode' in err) {
      const statusCode = (err as any).statusCode

      if (statusCode === 409) {
        // Conflict - booking expired or invalid state
        toast.add({
          title: 'Payment failed',
          description: errorMsg,
          color: 'error',
        })
        // Refresh to get latest status
        await refresh()
      } else if (statusCode === 404) {
        // Not found
        toast.add({
          title: 'Booking not found',
          description: 'This booking no longer exists',
          color: 'error',
        })
      } else if (statusCode >= 500) {
        // Server error
        toast.add({
          title: 'Server error',
          description: 'Payment service temporarily unavailable. Please try again.',
          color: 'error',
        })
      } else {
        toast.add({
          title: 'Payment failed',
          description: errorMsg,
          color: 'error',
        })
      }
    } else {
      toast.add({
        title: 'Payment failed',
        description: errorMsg,
        color: 'error',
      })
    }
  } finally {
    isProcessing.value = false
  }
}
```

---

## Implementation Checklist

- [ ] Create `packages/backend/src/shared/filters/prisma-error.filter.ts`
- [ ] Update `packages/backend/src/main.ts` to register PrismaExceptionFilter
- [ ] Update `packages/frontend/app/composables/useApi.ts` with enhanced error handling
- [ ] Update `packages/backend/src/modules/booking/booking-cleanup.service.ts` with try-catch
- [ ] Update validation decorators to be consistent
- [ ] Update `BookingForm.vue` with improved error handling
- [ ] Update booking detail page with improved error handling
- [ ] Add tests for Prisma error filter
- [ ] Add tests for frontend error handling
- [ ] Document error types and handling strategy

---

## Testing the Fixes

### Backend: Test Prisma Error Filter
```bash
# Create a test to verify 404 handling
curl -X GET http://localhost:3000/api/bookings/00000000-0000-0000-0000-000000000000
# Should return: { statusCode: 404, message: "...", error: "RECORD_NOT_FOUND" }

# Test validation error
curl -X POST http://localhost:3000/api/bookings/reserve \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid", "seats": 1, "travelId": "uuid"}'
# Should return: { statusCode: 400, message: "...", errors: [...] }
```

### Frontend: Test Error Handling
```typescript
// In browser console, test error handling
const api = useApi()

// Test validation error
try {
  await api.bookings.reserve({ email: 'invalid', seats: 1, travelId: 'x' })
} catch (err) {
  console.log('Is validation error?', isValidationError(err))
  console.log('Errors:', getValidationErrors(err))
}

// Test 404 error
try {
  await api.bookings.getById('00000000-0000-0000-0000-000000000000')
} catch (err) {
  console.log('Status code:', err.statusCode)
  console.log('Message:', getErrorMessage(err))
}
```

