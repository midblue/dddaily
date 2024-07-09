<template>
  <div class="timer flexcenter gaptiny" @click="click">
    <div
      class="progress"
      :style="{
        width:
          (1 - remaining / (minutes * 60 * 1000)) * 100 +
          '%',
      }"
    ></div>
    <span class="small">{{
      c.msToTimeString(remaining)
    }}</span>
    <span>
      <span @click.stop="click" class="clickable"
        ><span v-if="running">⏸︎</span
        ><span v-else>⏵︎</span></span
      ><span
        @click.stop="reset"
        v-if="!running && remaining !== minutes * 60 * 1000"
        class="clickable"
        >↻</span
      ></span
    >
  </div>
</template>

<script setup lang="ts">
import * as c from '~/common'

const { minutes } = defineProps({
  minutes: {
    type: Number,
    default: 0,
  },
})

const running = ref<boolean>(false)
const remaining = ref<number>(minutes * 60 * 1000)

let interval: any = null
onUnmounted(() => {
  if (interval) clearInterval(interval)
})

function click() {
  if (running.value) {
    running.value = false
    clearInterval(interval)
  } else {
    running.value = true
    interval = setInterval(() => {
      remaining.value -= 1000
      if (remaining.value <= 0) {
        running.value = false
        clearInterval(interval)
      }
    }, 1000)
  }
}

function reset() {
  remaining.value = minutes * 60 * 1000
  running.value = false
  clearInterval(interval)
}
</script>

<style lang="scss" scoped>
.timer {
  position: relative;
  height: 1.4em;
  line-height: 1;
  padding-top: 0.1em;
  padding-left: 0.3em;
  border-radius: var(--borderRadius);
  overflow: hidden;
  background: var(--bgD2);

  .progress {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    background: rgba(black, 0.07);
    pointer-events: none;
  }

  .clickable {
    cursor: pointer;
    padding: 0 0.3em;
    height: 100%;

    &:hover {
      background: rgba(black, 0.1);
    }
  }
}
</style>
