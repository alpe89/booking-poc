/**
 * Composable for centralized loading state management
 * Provides a simple API to track loading states across components
 */

import { ref, computed } from 'vue'

export const useLoading = (initialState = false) => {
  const isLoading = ref(initialState)
  const loadingCount = ref(0)

  const startLoading = () => {
    loadingCount.value++
    isLoading.value = true
  }

  const stopLoading = () => {
    loadingCount.value = Math.max(0, loadingCount.value - 1)
    if (loadingCount.value === 0) {
      isLoading.value = false
    }
  }

  const setLoading = (state: boolean) => {
    isLoading.value = state
    loadingCount.value = state ? 1 : 0
  }

  /**
   * Wraps an async function with loading state management
   * Automatically starts loading before execution and stops after
   */
  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      startLoading()
      return await fn()
    } finally {
      stopLoading()
    }
  }

  return {
    isLoading: computed(() => isLoading.value),
    startLoading,
    stopLoading,
    setLoading,
    withLoading,
  }
}
