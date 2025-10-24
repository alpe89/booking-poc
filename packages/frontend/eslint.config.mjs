// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

const baseConfig = createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: false,
    typescript: true,
  },
})

export default baseConfig.append(eslintPluginPrettierRecommended).append({
  ignores: ['.nuxt/**', 'node_modules/**', '**/*.d.ts'],
  languageOptions: {
    globals: {
      defineAppConfig: 'readonly',
      defineProps: 'readonly',
      defineEmits: 'readonly',
      defineExpose: 'readonly',
      withDefaults: 'readonly',
      useAsyncData: 'readonly',
      useLazyAsyncData: 'readonly',
      useFetch: 'readonly',
      useLazyFetch: 'readonly',
      onNuxtReady: 'readonly',
      useSeoMeta: 'readonly',
    },
  },
})
