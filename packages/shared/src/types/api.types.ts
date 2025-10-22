/**
 * Standardized API response format
 */
export type ApiResponse<T, M = undefined> = M extends undefined
  ? { data: T; message?: string }
  : { data: T; meta: M; message?: string }

/**
 * Pagination metadata
 */
export type PaginationMeta = {
  total: number
  page: number
  limit: number
}

/**
 * Travel detail metadata
 */
export type TravelDetailMeta = {
  availableSeats: number
}

/**
 * Booking reserve metadata
 */
export type BookingReserveMeta = {
  expiresAt: string
}

/**
 * Booking detail metadata
 */
export type BookingDetailMeta = {
  remainingTime: number | null
}

/**
 * Booking confirm metadata
 */
export type BookingConfirmMeta = {
  payment: {
    transactionId: string
    status: 'completed' | 'failed'
    errorCode: string | null
  }
}

/**
 * API Error response
 */
export type ApiError = {
  statusCode: number
  message: string
  error?: string
  errors?: Array<{
    path: string
    message: string
    code: string
  }>
}
