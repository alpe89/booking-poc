import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useCountdown } from './useCountdown'
import { nextTick, createApp } from 'vue'

const mountCountdown = (options: Parameters<typeof useCountdown>[0]) => {
  let composable!: ReturnType<typeof useCountdown>

  const app = createApp({
    setup() {
      composable = useCountdown(options)
      return () => null
    },
  })

  const root = document.createElement('div')
  document.body.appendChild(root)
  app.mount(root)

  const cleanup = () => {
    app.unmount()
    root.remove()
  }

  return { cleanup, ...composable } as ReturnType<typeof useCountdown> & { cleanup: () => void }
}

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with initial time', () => {
    const countdown = mountCountdown({ initialTime: 100 })
    expect(countdown.remainingTime.value).toBe(100)
    countdown.cleanup()
  })

  it('should initialize with null if no initial time', () => {
    const countdown = mountCountdown({ initialTime: null })
    expect(countdown.remainingTime.value).toBeNull()
    countdown.cleanup()
  })

  it('should format time correctly', () => {
    const countdown = mountCountdown({ initialTime: 125 })
    expect(countdown.formattedTime.value).toBe('2m 5s')
    countdown.cleanup()
  })

  it('should format zero time', () => {
    const countdown = mountCountdown({ initialTime: 0 })
    expect(countdown.formattedTime.value).toBe('0m 0s')
    countdown.cleanup()
  })

  it('should start countdown and decrement every second', async () => {
    const countdown = mountCountdown({ initialTime: null })

    countdown.reset(10)
    await nextTick()

    expect(countdown.remainingTime.value).toBe(10)

    vi.advanceTimersByTime(1000)
    await nextTick()
    expect(countdown.remainingTime.value).toBe(9)

    vi.advanceTimersByTime(1000)
    await nextTick()
    expect(countdown.remainingTime.value).toBe(8)

    countdown.cleanup()
  })

  it('should call onExpire when countdown reaches zero', async () => {
    const onExpire = vi.fn()
    const countdown = mountCountdown({ initialTime: null, onExpire })

    countdown.reset(2)
    await nextTick()

    vi.advanceTimersByTime(2000)
    await nextTick()

    expect(onExpire).toHaveBeenCalledTimes(1)
    countdown.cleanup()
  })

  it('should stop countdown when stop is called', async () => {
    const countdown = mountCountdown({ initialTime: null })

    countdown.reset(10)
    await nextTick()

    vi.advanceTimersByTime(2000)
    await nextTick()
    expect(countdown.remainingTime.value).toBe(8)

    countdown.stop()
    vi.advanceTimersByTime(5000)
    await nextTick()

    // Should not change after stop
    expect(countdown.remainingTime.value).toBe(8)
    countdown.cleanup()
  })

  it('should reset countdown to new time', async () => {
    const countdown = mountCountdown({ initialTime: null })

    countdown.reset(50)
    await nextTick()

    expect(countdown.remainingTime.value).toBe(50)
    countdown.cleanup()
  })

  it('should call onSync periodically when provided', async () => {
    const onSync = vi.fn().mockResolvedValue(100)
    const countdown = mountCountdown({
      initialTime: null,
      onSync,
      syncInterval: 5000,
    })

    countdown.reset(10)
    await nextTick()

    vi.advanceTimersByTime(5000)
    await nextTick()

    expect(onSync).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(5000)
    await nextTick()

    expect(onSync).toHaveBeenCalledTimes(2)
    countdown.cleanup()
  })

  it('should not start if initial time is null', async () => {
    const countdown = mountCountdown({ initialTime: null })

    countdown.start()
    await nextTick()

    vi.advanceTimersByTime(5000)
    await nextTick()

    expect(countdown.remainingTime.value).toBeNull()
    countdown.cleanup()
  })

  it('should not start if initial time is zero', async () => {
    const onExpire = vi.fn()
    const countdown = mountCountdown({ initialTime: null, onExpire })

    countdown.reset(0)
    countdown.start()
    await nextTick()

    vi.advanceTimersByTime(1000)
    await nextTick()

    expect(countdown.remainingTime.value).toBe(0)
    expect(onExpire).not.toHaveBeenCalled()
    countdown.cleanup()
  })

  it('should update remaining time from onSync result', async () => {
    const onSync = vi.fn().mockResolvedValue(50)
    const countdown = mountCountdown({
      initialTime: null,
      onSync,
      syncInterval: 2000,
    })

    countdown.reset(10)
    await nextTick()

    vi.advanceTimersByTime(2000)
    await nextTick()
    // Wait for async onSync to complete
    await vi.waitFor(() => expect(countdown.remainingTime.value).toBe(50))
    countdown.cleanup()
  })
})
