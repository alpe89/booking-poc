<template>
  <div>
    <p class="text-sm text-gray-500">{{ label }}</p>
    <p :class="valueClass">{{ value }}</p>
  </div>
</template>

<script setup lang="ts">
type Props = {
  label: string
  value: string | number
  valueClass?: string
}

withDefaults(defineProps<Props>(), {
  valueClass: 'text-gray-900',
})
</script>
