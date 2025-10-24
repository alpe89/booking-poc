/**
 * Composable for countdown timer with server sync
 * Handles client-side countdown with periodic server synchronization
 */

import { ref, computed, readonly, onMounted, onUnmounted } from 'vue'

type UseCountdownOptions = {
  /**
   * Initial remaining time in seconds
   */
  initialTime: number | null

  /**
   * Callback when countdown reaches zero
   */
  onExpire?: () => void

  /**
   * Callback for periodic sync with server
   * Should return updated remaining time
   */
  onSync?: () => Promise<number | null>

  /**
   * Interval for countdown updates in milliseconds (default: 1000)
   */
  countdownInterval?: number

  /**
   * Interval for server sync in milliseconds (default: 30000)
   */
  syncInterval?: number
}

export const useCountdown = (options: UseCountdownOptions) => {
  const { initialTime, onExpire, onSync, countdownInterval = 1000, syncInterval = 30000 } = options

  const remainingTime = ref<number | null>(initialTime)
  let countdownIntervalId: ReturnType<typeof setInterval> | null = null
  let syncIntervalId: ReturnType<typeof setInterval> | null = null

  /**
   * Start the countdown timer
   */
  const start = () => {
    if (remainingTime.value === null || remainingTime.value <= 0) {
      return
    }

    // Update countdown every second
    countdownIntervalId = setInterval(() => {
      if (remainingTime.value !== null && remainingTime.value > 0) {
        remainingTime.value -= 1

        // If time expired, trigger callback and cleanup
        if (remainingTime.value <= 0) {
          stop()
          onExpire?.()
        }
      }
    }, countdownInterval)

    // Sync with server periodically if callback provided
    if (onSync) {
      syncIntervalId = setInterval(async () => {
        try {
          const updatedTime = await onSync()
          if (updatedTime !== null && updatedTime !== remainingTime.value) {
            remainingTime.value = updatedTime
          }
        } catch (error) {
          console.error('Failed to sync countdown with server:', error)
        }
      }, syncInterval)
    }
  }

  /**
   * Stop the countdown timer and cleanup
   */
  const stop = () => {
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId)
      countdownIntervalId = null
    }
    if (syncIntervalId) {
      clearInterval(syncIntervalId)
      syncIntervalId = null
    }
  }

  /**
   * Reset countdown to a new time and restart
   */
  const reset = (newTime: number | null) => {
    stop()
    remainingTime.value = newTime
    if (newTime !== null && newTime > 0) {
      start()
    }
  }

  /**
   * Get remaining time as formatted string (e.g., "5m 30s")
   */
  const { formatTime } = useFormatters()
  const formattedTime = computed(() => {
    return remainingTime.value !== null ? formatTime(remainingTime.value) : '0m 0s'
  })

  // Auto-start on mount if initial time is valid (only if in component context)
  if (typeof window !== 'undefined') {
    try {
      onMounted(() => {
        if (remainingTime.value !== null && remainingTime.value > 0) {
          start()
        }
      })

      // Cleanup on unmount
      onUnmounted(() => {
        stop()
      })
    } catch {
      // Not in component context (e.g., tests), skip lifecycle hooks
    }
  }

  return {
    remainingTime: readonly(remainingTime),
    formattedTime,
    start,
    stop,
    reset,
  }
}
