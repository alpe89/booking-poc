import { describe, it, expect } from 'vitest'
import { useMoods } from './useMoods'
import type { TravelSerialized } from '@booking/shared'

describe('useMoods', () => {
  const { getTopMoods, getMoodEntries, getPrimaryMoodLabel, getTripTagline } = useMoods()

  const mockMoods: TravelSerialized['moods'] = {
    nature: 80,
    relax: 60,
    history: 40,
    culture: 90,
    party: 20,
  }

  describe('getTopMoods', () => {
    it('should return top 3 moods by default', () => {
      const result = getTopMoods(mockMoods)
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual(['culture', 90])
      expect(result[1]).toEqual(['nature', 80])
      expect(result[2]).toEqual(['relax', 60])
    })

    it('should return custom number of top moods', () => {
      const result = getTopMoods(mockMoods, 2)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(['culture', 90])
      expect(result[1]).toEqual(['nature', 80])
    })

    it('should handle empty moods object', () => {
      const result = getTopMoods({})
      expect(result).toEqual([])
    })

    it('should return all moods if limit exceeds total', () => {
      const result = getTopMoods(mockMoods, 10)
      expect(result).toHaveLength(5)
    })
  })

  describe('getMoodEntries', () => {
    it('should convert moods object to array of entries', () => {
      const result = getMoodEntries(mockMoods)
      expect(result).toHaveLength(5)
      expect(result).toContainEqual({ mood: 'nature', value: 80 })
      expect(result).toContainEqual({ mood: 'culture', value: 90 })
    })

    it('should handle empty moods object', () => {
      const result = getMoodEntries({})
      expect(result).toEqual([])
    })
  })

  describe('getPrimaryMoodLabel', () => {
    it('should return the mood with highest value', () => {
      const result = getPrimaryMoodLabel(mockMoods)
      expect(result).toBe('Culture')
    })

    it('should return "Explorer" for empty moods', () => {
      const result = getPrimaryMoodLabel({})
      expect(result).toBe('Explorer')
    })

    it('should handle single mood', () => {
      const result = getPrimaryMoodLabel({ nature: 100 })
      expect(result).toBe('Nature')
    })
  })

  describe('getTripTagline', () => {
    it('should return "Short Escape" for trips 7 days or less', () => {
      const start = '2025-03-15'
      const end = '2025-03-20' // 5 days duration

      const result = getTripTagline(start, end)
      expect(result).toBe('Short Escape')
    })

    it('should return "Explorer Tour" for trips between 8-10 days', () => {
      const start = '2025-03-15'
      const end = '2025-03-24' // 9 days duration

      const result = getTripTagline(start, end)
      expect(result).toBe('Explorer Tour')
    })

    it('should return "Grand Adventure" for trips longer than 10 days', () => {
      const start = '2025-03-15'
      const end = '2025-03-30' // 15 days duration

      const result = getTripTagline(start, end)
      expect(result).toBe('Grand Adventure')
    })
  })
})
