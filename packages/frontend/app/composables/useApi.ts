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
} from "@booking/shared";

type QueryParams = Record<string, string | number | boolean | null | undefined>;

type FetcherOptions = Omit<
  Parameters<typeof $fetch>[1],
  "baseURL" | "headers" | "query" | "body" | "method"
> & {
  query?: QueryParams;
  body?: BodyInit | Record<string, unknown>;
  headers?: HeadersInit;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
};

export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = import.meta.server
    ? config.apiBaseInternal ?? config.public.apiBase
    : config.public.apiBase;

  const handleRequest = async <T>(
    endpoint: string,
    options: FetcherOptions = {}
  ): Promise<T> => {
    const { headers, ...rest } = options;

    try {
      return await $fetch<T>(endpoint, {
        baseURL,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        ...rest,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred");
    }
  };

  return {
    // Travel endpoints
    travels: {
      list: (query?: GetTravelsQuery) =>
        handleRequest<ApiResponse<TravelSerialized[], PaginationMeta>>(
          "/travels",
          {
            query,
          }
        ),

      getBySlug: (slug: string) =>
        handleRequest<ApiResponse<TravelSerialized, TravelDetailMeta>>(
          `/travels/${slug}`
        ),
    },

    // Booking endpoints
    bookings: {
      reserve: (data: ReserveBookingDto) =>
        handleRequest<ApiResponse<BookingSerialized, BookingReserveMeta>>(
          "/bookings/reserve",
          {
            method: "POST",
            body: data,
          }
        ),

      getById: (id: string) =>
        handleRequest<ApiResponse<BookingSerialized, BookingDetailMeta>>(
          `/bookings/${id}`
        ),

      confirm: (id: string, data: ConfirmBookingDto) =>
        handleRequest<ApiResponse<BookingSerialized, BookingConfirmMeta>>(
          `/bookings/${id}/confirm`,
          {
            method: "POST",
            body: data,
          }
        ),

      cancel: (id: string) =>
        handleRequest<ApiResponse<BookingSerialized>>(
          `/bookings/${id}`,
          {
            method: "DELETE",
          }
        ),
    },
  };
};
