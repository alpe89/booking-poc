import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BookingForm from './BookingForm.vue'

describe('BookingForm', () => {
  const defaultProps = {
    travelId: '123-456',
    pricePerSeat: 50000, // 500 EUR
    availableSeats: 3,
  }

  it('should render email and seats input fields', () => {
    const wrapper = mount(BookingForm, { props: defaultProps })

    expect(wrapper.html()).toContain('Email')
    expect(wrapper.html()).toContain('Number of seats')
  })

  it('should calculate total amount correctly', () => {
    const wrapper = mount(BookingForm, { props: defaultProps })

    // 1 seat * 500 EUR = 500.00
    expect(wrapper.text()).toContain('500.00')
  })

  it('should show "Sold out" when no seats available', () => {
    const wrapper = mount(BookingForm, {
      props: { ...defaultProps, availableSeats: 0 },
    })

    expect(wrapper.text()).toContain('Sold out')
  })

  it('should show warning when limited stock', () => {
    const wrapper = mount(BookingForm, {
      props: { ...defaultProps, availableSeats: 2 },
    })

    expect(wrapper.text()).toContain('Last seats')
  })

  it('should emit submit event with booking data', async () => {
    const wrapper = mount(BookingForm, { props: defaultProps })

    // Find form and trigger submit
    const form = wrapper.find('form')
    await form.trigger('submit')

    expect(wrapper.emitted('submit')).toBeTruthy()
  })

  it('should disable form when sold out', () => {
    const wrapper = mount(BookingForm, {
      props: { ...defaultProps, availableSeats: 0 },
    })

    const button = wrapper.find('button[type="submit"]')
    expect(button.exists()).toBe(false) // Button not rendered when sold out
  })
})
