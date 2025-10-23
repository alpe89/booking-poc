/**
 * Composable for common formatting utilities
 * Centralizes date, price, and time formatting logic
 */

export const useFormatters = () => {
  /**
   * Format a date string to localized format
   * @param dateString - ISO date string
   * @param locale - BCP 47 language tag (default: 'en-US')
   * @param options - Intl.DateTimeFormatOptions
   */
  const formatDate = (
    dateString: string,
    locale: string = 'en-US',
    options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  ) => {
    return new Date(dateString).toLocaleDateString(locale, options)
  }

  /**
   * Format a date string to short format (e.g., "Jan 15, 2024")
   */
  const formatDateShort = (dateString: string, locale: string = 'en-US') => {
    return formatDate(dateString, locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  /**
   * Format price from cents to currency string
   * @param cents - Price in cents
   * @param currency - Currency code (default: 'EUR')
   * @param locale - BCP 47 language tag (default: 'en-US')
   */
  const formatPrice = (
    cents: number,
    currency: string = 'EUR',
    locale: string = 'en-US'
  ) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(cents / 100)
  }

  /**
   * Format seconds to minutes and seconds string (e.g., "5m 30s")
   * @param seconds - Total seconds
   */
  const formatTime = (seconds: number) => {
    if (seconds <= 0) {
      return '0m 0s'
    }
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  /**
   * Format duration between two dates in days
   * @param startDate - Start date string
   * @param endDate - End date string
   */
  const formatDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    )
    return `${days} ${days === 1 ? 'day' : 'days'}`
  }

  return {
    formatDate,
    formatDateShort,
    formatPrice,
    formatTime,
    formatDuration,
  }
}
