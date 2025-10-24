import { describe, it, expect } from 'vitest'
import { useFormatters } from './useFormatters'

describe('useFormatters', () => {
  const { formatDate, formatDateShort, formatPrice, formatTime, formatDuration } = useFormatters()

  describe('formatDate', () => {
    it('should format date with default locale (it-IT)', () => {
      const date = '2025-03-15T10:30:00Z'
      const result = formatDate(date)
      expect(result).toBe('15 marzo 2025')
    })

    it('should format date with custom locale', () => {
      const date = '2025-03-15T10:30:00Z'
      const result = formatDate(date, 'en-US')
      expect(result).toMatch(/March|Mar/)
    })

    it('should handle invalid dates gracefully', () => {
      const result = formatDate('invalid-date')
      expect(result).toBe('Invalid Date')
    })
  })

  describe('formatDateShort', () => {
    it('should format date in short format', () => {
      const date = '2025-03-15T10:30:00Z'
      const result = formatDateShort(date)
      expect(result).toBe('15 mar 2025')
    })
  })

  describe('formatPrice', () => {
    it('should format price in cents to EUR with symbol', () => {
      const cents = 12500 // 125.00 EUR
      const result = formatPrice(cents)
      expect(result).toBe('125,00 €')
    })

    it('should format price with different currency', () => {
      const cents = 9999
      const result = formatPrice(cents, 'USD')
      expect(result).toBe('99,99 USD')
    })

    it('should handle zero price', () => {
      const result = formatPrice(0)
      expect(result).toBe('0,00 €')
    })

    it('should handle negative prices', () => {
      const result = formatPrice(-5000)
      expect(result).toContain('-')
      expect(result).toContain('50,00')
    })
  })

  describe('formatTime', () => {
    it('should format seconds as minutes and seconds', () => {
      expect(formatTime(0)).toBe('0m 0s')
      expect(formatTime(30)).toBe('0m 30s')
      expect(formatTime(60)).toBe('1m 0s')
      expect(formatTime(125)).toBe('2m 5s')
      expect(formatTime(3661)).toBe('61m 1s')
    })

    it('should handle negative time', () => {
      const result = formatTime(-10)
      expect(result).toBe('0m 0s')
    })
  })

  describe('formatDuration', () => {
    it('should calculate days between two dates', () => {
      const start = '2025-03-15'
      const end = '2025-03-20'
      const result = formatDuration(start, end)
      expect(result).toBe('5 days')
    })

    it('should return "1 day" for singular', () => {
      const start = '2025-03-15'
      const end = '2025-03-16'
      const result = formatDuration(start, end)
      expect(result).toBe('1 day')
    })

    it('should handle same day', () => {
      const start = '2025-03-15'
      const end = '2025-03-15'
      const result = formatDuration(start, end)
      expect(result).toBe('1 day')
    })

    it('should handle invalid dates', () => {
      const result = formatDuration('invalid', '2025-03-15')
      expect(result).toMatch(/NaN|Invalid/)
    })
  })
})
