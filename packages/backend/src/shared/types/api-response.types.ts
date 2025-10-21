/**
 * Standardized API Response Types
 * All API responses follow this consistent structure
 */

/**
 * Base standardized response wrapper
 * All endpoints return data wrapped in this structure
 */
export interface ApiResponse<T, M = undefined> {
  data: T;
  meta?: M;
  message?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

/**
 * Travel detail metadata
 */
export interface TravelDetailMeta {
  availableSeats: number;
}

/**
 * Booking reservation metadata
 */
export interface BookingReserveMeta {
  expiresAt: string;
}

/**
 * Booking detail metadata
 */
export interface BookingDetailMeta {
  remainingTime: number | null;
}

/**
 * Payment information for booking confirmation
 */
export interface PaymentInfo {
  transactionId: string;
  status: 'completed' | 'failed';
  errorCode: string | null;
}

/**
 * Booking confirmation metadata
 */
export interface BookingConfirmMeta {
  payment: PaymentInfo;
}

/**
 * Marker interface to indicate a service method should return raw data
 * without automatic wrapping (data + meta are returned separately)
 */
export interface ServiceResponse<T, M = undefined> {
  data: T;
  meta?: M;
  message?: string;
}
