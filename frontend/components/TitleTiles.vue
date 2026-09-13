<script setup lang="ts">
const props = defineProps<{ text: string }>()
const words = computed(() => props.text.toUpperCase().split(' '))
</script>

<template>
  <div class="flex items-center gap-3">
    <div v-for="(word, wi) in words" :key="wi" class="flex gap-1">
      <span
        v-for="(letter, li) in word.split('')"
        :key="li"
        class="flex h-8 w-8 items-center justify-center rounded-sm border-2 border-amber-400 bg-ink-800 text-lg font-extrabold text-fog-100 shadow-[inset_0_-2px_0_rgba(0,0,0,0.5),inset_0_2px_0_rgba(255,255,255,0.1)]"
      >{{ letter }}</span>
    </div>
  </div>
</template>