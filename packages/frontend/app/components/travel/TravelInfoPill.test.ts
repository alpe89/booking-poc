import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TravelInfoPill from './TravelInfoPill.vue'

describe('TravelInfoPill', () => {
  it('should render icon and text', () => {
    const wrapper = mount(TravelInfoPill, {
      props: {
        icon: 'i-heroicons-calendar-days',
        text: 'March 15, 2025',
      },
    })

    expect(wrapper.text()).toContain('March 15, 2025')
  })

  it('should apply correct icon class', () => {
    const wrapper = mount(TravelInfoPill, {
      props: {
        icon: 'i-heroicons-calendar-days',
        text: 'Test',
      },
    })

    expect(wrapper.html()).toContain('i-heroicons-calendar-days')
  })
})
