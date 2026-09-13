<script setup lang="ts">
// Renders a number as a row of slot-machine reels: each digit position is a
// vertical strip of 0-9 that's shifted via CSS transform to reveal the
// current digit, so a value change animates like a reel spinning to rest.
const props = defineProps<{ value: number }>()

const DIGIT_HEIGHT = 28 // px - tune to match the font-size/line-height used where this is placed

const digits = computed(() => String(Math.max(0, Math.floor(props.value))).split('').map(Number))
</script>

<template>
  <span class="inline-flex align-middle">
    <span
      v-for="(d, i) in digits"
      :key="i"
      class="relative inline-block overflow-hidden"
      :style="{ height: DIGIT_HEIGHT + 'px', width: '1ch' }"
    >
      <span
        class="absolute left-0 top-0 flex flex-col transition-transform duration-500 ease-out"
        :style="{ transform: `translateY(-${d * DIGIT_HEIGHT}px)` }"
      >
        <span
          v-for="n in 10"
          :key="n"
          class="flex items-center justify-center"
          :style="{ height: DIGIT_HEIGHT + 'px' }"
        >{{ n - 1 }}</span>
      </span>
    </span>
  </span>
</template>