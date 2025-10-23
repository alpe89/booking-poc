<template>
  <div class="flex items-center gap-2 rounded-full border border-white/60 bg-white/40 px-4 py-2">
    <UIcon :name="icon" class="h-5 w-5" />
    <span>{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
type Props = {
  icon: string
  text: string
}

defineProps<Props>()
</script>
