<template>
  <span class="sub" v-if="el.currentStreak > 0">
    {{ el.currentStreak }} day
    {{ fullClear ? 'full clear ' : '' }}streak
  </span>
  <span class="sub" v-else-if="el.currentStreak < -1">
    {{ el.currentStreak * -1 }} day
    {{ fullClear ? 'full clear ' : '' }}slump?
  </span>
  <span
    class="sub"
    v-else-if="
      el.currentStreak === -1 &&
      el.currentStreakNotIncludingToday > 0
    "
  >
    Finish for
    {{ el.currentStreakNotIncludingToday + 1 }} day
    {{ fullClear ? 'full clear ' : '' }}streak
  </span>
  <span
    class="sub"
    v-else-if="el.clearsAsBooleanArray.length === 1"
  >
    Let's get started!
  </span>

  <span
    v-if="el.currentStreak === el.bestStreak"
    class="small tag"
  >
    Best ever
  </span>
  <span
    v-else-if="el.currentStreak > 0"
    class="small tag minor"
  >
    {{ el.bestStreak - el.currentStreak }} more to beat best
  </span>
  <span
    v-else-if="
      el.currentStreak === -1 &&
      el.bestStreak &&
      el.currentStreakNotIncludingToday + 1 >= el.bestStreak
    "
    class="small tag"
  >
    Will be best ever!
  </span>
  <span
    v-else-if="el.currentStreak === -1 && el.bestStreak"
    class="small tag minor"
    >+{{
      el.bestStreak - Math.max(0, el.currentStreak) + 1
    }}
    to beat best</span
  >
  <span
    v-else-if="el.currentStreak === -1"
    class="small tag minor"
    >Due now</span
  >
  <span
    v-else-if="el.currentStreak === -2"
    class="small tag"
  >
    Don't miss twice!
  </span>
  <span
    v-else-if="el.currentStreak < -2"
    class="small tag minor"
  >
    It starts again today.
  </span>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import type { ClearableWithXP } from '~/assets/nowThis/DataStructure/BaseClasses/ClearableWithXP'
import * as appState from '~/assets/nowThis/appState'

const { el, fullClear } = defineProps({
  el: {
    type: Object as PropType<ClearableWithXP>,
    required: true,
  },
  fullClear: {
    type: Boolean,
    default: false,
  },
})
</script>

<style lang="scss" scoped>
.tag {
  background: var(--highlight-l);
  color: var(--highlight);
  font-size: 0.7em;
  font-weight: 600;
  padding: 1px 4px 2px 4px;
  border-radius: var(--borderRadius);

  &.minor {
    background: rgba(150, 150, 150, 0.2);
    color: rgba(150, 150, 150, 1);
  }
}
</style>
