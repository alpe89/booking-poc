/**
 * Composable for travel mood utilities
 * Handles mood sorting, filtering, and labeling
 */

import type { TravelSerialized } from '@booking/shared'

export const useMoods = () => {
  /**
   * Get top N moods sorted by value
   * @param moods - Mood object from travel
   * @param limit - Number of top moods to return (default: 3)
   */
  const getTopMoods = (moods: TravelSerialized['moods'], limit: number = 3) => {
    return Object.entries(moods)
      .filter(([_, value]) => value > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
  }

  /**
   * Get all moods as sorted array of {mood, value}
   */
  const getMoodEntries = (moods: TravelSerialized['moods']) => {
    return Object.entries(moods)
      .map(([mood, moodValue]) => ({ mood, value: moodValue }))
      .filter((entry) => entry.value > 0)
  }

  /**
   * Get primary mood label for badge display
   * @param moods - Mood object from travel
   */
  const getPrimaryMoodLabel = (moods: TravelSerialized['moods']): string => {
    const topMood = getTopMoods(moods, 1)[0]
    if (!topMood) return 'Explorer'

    const [mood] = topMood

    // Simple heuristic: party mood > 50 = Party, otherwise use top mood name
    if (moods.party > 50) return 'Party'

    return mood.charAt(0).toUpperCase() + mood.slice(1)
  }

  /**
   * Calculate trip duration tagline based on days
   * @param startDate - Start date string
   * @param endDate - End date string
   */
  const getTripTagline = (startDate: string, endDate: string): string => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const duration = Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    )

    if (duration <= 7) return 'Short Escape'
    if (duration <= 10) return 'Explorer Tour'
    return 'Grand Adventure'
  }

  return {
    getTopMoods,
    getMoodEntries,
    getPrimaryMoodLabel,
    getTripTagline,
  }
}
