import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useCountdown } from './useCountdown'
import { nextTick } from 'vue'

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with initial time', () => {
    const { remainingTime } = useCountdown({ initialTime: 100 })
    expect(remainingTime.value).toBe(100)
  })

  it('should initialize with null if no initial time', () => {
    const { remainingTime } = useCountdown({ initialTime: null })
    expect(remainingTime.value).toBeNull()
  })

  it('should format time correctly', () => {
    const { formattedTime } = useCountdown({ initialTime: 125 })
    expect(formattedTime.value).toBe('2m 5s')
  })

  it('should format zero time', () => {
    const { formattedTime } = useCountdown({ initialTime: 0 })
    expect(formattedTime.value).toBe('0m 0s')
  })

  it('should start countdown and decrement every second', async () => {
    const { remainingTime, start } = useCountdown({ initialTime: 10 })

    start()
    await nextTick()

    expect(remainingTime.value).toBe(10)

    vi.advanceTimersByTime(1000)
    await nextTick()
    expect(remainingTime.value).toBe(9)

    vi.advanceTimersByTime(1000)
    await nextTick()
    expect(remainingTime.value).toBe(8)
  })

  it('should call onExpire when countdown reaches zero', async () => {
    const onExpire = vi.fn()
    const { start } = useCountdown({ initialTime: 2, onExpire })

    start()
    await nextTick()

    vi.advanceTimersByTime(2000)
    await nextTick()

    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  it('should stop countdown when stop is called', async () => {
    const { remainingTime, start, stop } = useCountdown({ initialTime: 10 })

    start()
    await nextTick()

    vi.advanceTimersByTime(2000)
    await nextTick()
    expect(remainingTime.value).toBe(8)

    stop()
    vi.advanceTimersByTime(5000)
    await nextTick()

    // Should not change after stop
    expect(remainingTime.value).toBe(8)
  })

  it('should reset countdown to new time', async () => {
    const { remainingTime, reset } = useCountdown({ initialTime: 10 })

    reset(50)
    await nextTick()

    expect(remainingTime.value).toBe(50)
  })

  it('should call onSync periodically when provided', async () => {
    const onSync = vi.fn().mockResolvedValue(100)
    const { start } = useCountdown({
      initialTime: 10,
      onSync,
      syncInterval: 5000,
    })

    start()
    await nextTick()

    vi.advanceTimersByTime(5000)
    await nextTick()

    expect(onSync).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(5000)
    await nextTick()

    expect(onSync).toHaveBeenCalledTimes(2)
  })

  it('should not start if initial time is null', async () => {
    const { remainingTime, start } = useCountdown({ initialTime: null })

    start()
    await nextTick()

    vi.advanceTimersByTime(5000)
    await nextTick()

    expect(remainingTime.value).toBeNull()
  })

  it('should not start if initial time is zero', async () => {
    const onExpire = vi.fn()
    const { remainingTime, start } = useCountdown({ initialTime: 0, onExpire })

    start()
    await nextTick()

    vi.advanceTimersByTime(1000)
    await nextTick()

    expect(remainingTime.value).toBe(0)
    expect(onExpire).not.toHaveBeenCalled()
  })

  it('should update remaining time from onSync result', async () => {
    const onSync = vi.fn().mockResolvedValue(50)
    const { remainingTime, start } = useCountdown({
      initialTime: 10,
      onSync,
      syncInterval: 2000,
    })

    start()
    await nextTick()

    vi.advanceTimersByTime(2000)
    await nextTick()
    // Wait for async onSync to complete
    await vi.waitFor(() => expect(remainingTime.value).toBe(50))
  })
})
