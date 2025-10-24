import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { ref, reactive, computed, watch, readonly } from 'vue'
import { useFormatters } from './app/composables/useFormatters'
import { useMoods } from './app/composables/useMoods'

declare global {
  var ref: typeof import('vue').ref
  var reactive: typeof import('vue').reactive
  var computed: typeof import('vue').computed
  var watch: typeof import('vue').watch
  var readonly: typeof import('vue').readonly
  var useFormatters: typeof import('./app/composables/useFormatters').useFormatters
  var useMoods: typeof import('./app/composables/useMoods').useMoods
  var useApi: typeof import('./app/composables/useApi').useApi
  var useToast: () => {
    add: (params: {
      title?: string
      description?: string
      color?: string
      timeout?: number
    }) => void
  }
  var navigateTo: (to: string) => Promise<void>
}

// Mock Nuxt auto-imported composables
vi.mock('#app', () => ({
  navigateTo: vi.fn(),
  useToast: vi.fn(() => ({
    add: vi.fn(),
  })),
  useRuntimeConfig: vi.fn(() => ({
    public: {
      apiBase: 'http://localhost:3000/api',
    },
  })),
}))

// Make Vue reactivity APIs available globally (Nuxt auto-imports these)
globalThis.ref = ref
globalThis.reactive = reactive
globalThis.computed = computed
globalThis.watch = watch
globalThis.readonly = readonly

// Make composables available globally
globalThis.useFormatters = useFormatters
globalThis.useMoods = useMoods
globalThis.useApi = vi.fn(() => ({
  travels: {
    list: vi.fn(),
    getBySlug: vi.fn(),
  },
  bookings: {
    reserve: vi.fn().mockResolvedValue({ data: {}, meta: {} }),
    getById: vi.fn(),
    confirm: vi.fn(),
    cancel: vi.fn(),
  },
}))
globalThis.useToast = vi.fn(() => ({
  add: vi.fn(),
}))
globalThis.navigateTo = vi.fn()

// Mock Nuxt UI components globally with simple implementations
config.global.stubs = {
  UIcon: {
    template: '<i />',
  },
  UBadge: {
    template: '<span><slot /></span>',
  },
  UButton: {
    template: '<button @click="$emit(\'click\')"><slot /></button>',
  },
  UCard: {
    template: '<div><slot name="header" /><slot /></div>',
  },
  UContainer: {
    template: '<div><slot /></div>',
  },
  USeparator: {
    template: '<hr />',
  },
  UAlert: {
    template: '<div><slot /></div>',
  },
  UPagination: {
    template: '<nav><slot /></nav>',
  },
  USkeleton: {
    template: '<div class="skeleton" />',
  },
  UInput: {
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue'],
  },
  NuxtLink: {
    template: '<a @click="$emit(\'click\')"><slot /></a>',
  },
  UForm: {
    template: '<form @submit.prevent="handleSubmit"><slot /></form>',
    props: ['state'],
    methods: {
      handleSubmit() {
        // Emit submit event with data property matching UForm's behavior
        this.$emit('submit', { data: this.state })
      },
    },
  },
  UFormField: {
    template: '<div><slot /></div>',
  },
}
