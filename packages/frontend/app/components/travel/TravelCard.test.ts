import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TravelCard from './TravelCard.vue'
import type { TravelSerialized } from '@booking/shared'

describe('TravelCard', () => {
  const mockTravel: TravelSerialized = {
    id: '123',
    slug: 'test-travel',
    name: 'Amazing Journey',
    description: 'This is a great travel experience',
    startingDate: '2025-03-15',
    endingDate: '2025-03-20',
    price: 99900, // 999.00 EUR
    totalSeats: 5,
    moods: {
      nature: 80,
      culture: 60,
      relax: 40,
    },
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  }

  beforeEach(() => {
    // Clear mock calls before each test
    vi.clearAllMocks()
  })

  it('should render travel name', () => {
    const wrapper = mount(TravelCard, {
      props: { travel: mockTravel },
    })

    expect(wrapper.text()).toContain('Amazing Journey')
  })

  it('should render travel description', () => {
    const wrapper = mount(TravelCard, {
      props: { travel: mockTravel },
    })

    expect(wrapper.text()).toContain('This is a great travel experience')
  })

  it('should render formatted price', () => {
    const wrapper = mount(TravelCard, {
      props: { travel: mockTravel },
    })

    expect(wrapper.text()).toContain('999,00')
  })

  it('should render total seats', () => {
    const wrapper = mount(TravelCard, {
      props: { travel: mockTravel },
    })

    expect(wrapper.text()).toContain('5 total seats')
  })

  it('should render top moods', () => {
    const wrapper = mount(TravelCard, {
      props: { travel: mockTravel },
    })

    expect(wrapper.text()).toContain('nature')
    expect(wrapper.text()).toContain('80%')
  })

  it('should navigate to travel detail page on click', async () => {
    const wrapper = mount(TravelCard, {
      props: { travel: mockTravel },
    })

    await wrapper.trigger('click')

    expect(globalThis.navigateTo).toHaveBeenCalledWith('/travels/test-travel')
  })

  it('should have cursor-pointer class', () => {
    const wrapper = mount(TravelCard, {
      props: { travel: mockTravel },
    })

    expect(wrapper.classes()).toContain('cursor-pointer')
  })
})
