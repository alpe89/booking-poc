import type {
  ApiResponse,
  PaginationMeta,
  TravelDetailMeta,
  BookingReserveMeta,
  BookingDetailMeta,
  BookingConfirmMeta,
  TravelSerialized,
  BookingSerialized,
  ApiError,
} from '@booking/shared'
import type { GetTravelsQuery, ReserveBookingDto, ConfirmBookingDto } from '@booking/shared'

type FetchOptions = RequestInit & {
  params?: Record<string, string | number>
}

export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL =
    typeof window === 'undefined'
      ? config.apiBaseInternal ?? config.public.apiBase
      : config.public.apiBase

  const handleRequest = async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
    const { params, ...fetchOptions } = options

    let url = `${baseURL}${endpoint}`

    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value))
      })
      url += `?${searchParams.toString()}`
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      })

      if (!response.ok) {
        const error: ApiError = await response.json()
        throw new Error(error.message || 'Request failed')
      }

      return await response.json()
    } catch (error) {
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
          params: query as Record<string, string | number>,
        }),

      getBySlug: (slug: string) =>
        handleRequest<ApiResponse<TravelSerialized, TravelDetailMeta>>(`/travels/${slug}`),
    },

    // Booking endpoints
    bookings: {
      reserve: (data: ReserveBookingDto) =>
        handleRequest<ApiResponse<BookingSerialized, BookingReserveMeta>>('/bookings/reserve', {
          method: 'POST',
          body: JSON.stringify(data),
        }),

      getById: (id: string) =>
        handleRequest<ApiResponse<BookingSerialized, BookingDetailMeta>>(`/bookings/${id}`),

      confirm: (id: string, data: ConfirmBookingDto) =>
        handleRequest<ApiResponse<BookingSerialized, BookingConfirmMeta>>(`/bookings/${id}/confirm`, {
          method: 'POST',
          body: JSON.stringify(data),
        }),

      cancel: (id: string) =>
        handleRequest<ApiResponse<BookingSerialized>>(`/bookings/${id}`, {
          method: 'DELETE',
        }),
    },
  }
}
