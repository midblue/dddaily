<template>
  <div class="clearDots">
    <span
      v-for="(
        datedBool, index
      ) in clearsAsDatedBooleanArrayReversed"
      class="clearDot"
      :class="{
        today: index === 0,
        didClear: datedBool.clear,
      }"
      @click.prevent.stop="
        el.setClearOnDate(!datedBool.clear, datedBool.date)
      "
      v-tooltip="
        `${new Date(datedBool.date).toLocaleDateString(
          'en-US',
          {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          },
        )}: ${datedBool.clear ? 'cleared' : 'not cleared'}`
      "
    >
      <span class="visibleDot"></span>
    </span>
    <span
      v-if="clearsAsDatedBooleanArrayReversed.length < 30"
      v-for="dummy in 30"
      class="clearDot dummy"
    >
      <span class="visibleDot"></span>
    </span>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import type { ClearableWithXP } from '~/assets/nowThis/DataStructure/BaseClasses/ClearableWithXP'
import * as appState from '~/assets/nowThis/appState'

const { el, showText } = defineProps({
  el: {
    type: Object as PropType<ClearableWithXP>,
    required: true,
  },
  showText: {
    type: Boolean,
    default: true,
  },
})

const clearsAsDatedBooleanArrayReversed = computed(() => {
  return [...el.clearsAsDatedBooleanArray].reverse()
})
</script>

<style lang="scss" scoped>
.clearDots {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  line-height: 1;
  max-width: 100%;
  overflow: hidden;
}
.clearDot {
  flex-shrink: 0;
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 15px;

  .visibleDot {
    width: 100%;
    height: 100%;
    background: var(--highlight, rgba(0, 0, 0, 0.5));
    flex-shrink: 0;
    border-radius: 100px;
  }

  &:not(.didClear) {
    opacity: 0.2;
  }

  &:not(.today) {
    width: 12px;
    height: 12px;
    padding: 2.5px 2.5px;
  }
  &.today {
    width: 14px;
    height: 12px;
    padding-right: 2px;
  }

  &.dummy {
    width: 10px;
    height: 10px;
    padding: 3.5px 3.5px;
  }
}
</style>
