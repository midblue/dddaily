<template>
  <div
    v-if="day"
    class="bar"
    :class="{
      succeeded:
        (day.effortExpended || 0) >=
        (day.acceptableEffort || 0),
    }"
  >
    <div class="bg"></div>
    <div
      class="fill1 flexverticalcenter gapsmall"
      :style="{
        width:
          ((day.effortExpended || 0) /
            (day.maxEffort || 1)) *
            100 +
          '%',
      }"
    >
      <svg
        class="marleft"
        width="19"
        height="17"
        viewBox="0 0 19 17"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.5 8.5L8 14L17 1"
          stroke="var(--highlight)"
          stroke-width="2.5"
        />
      </svg>
      <div class="smallcaps padtoptiny">Today</div>
    </div>
    <div
      class="bonus"
      :style="{
        width:
          (((day.maxEffort || 1) -
            (day.acceptableEffort || 0)) /
            (day.maxEffort || 1)) *
            100 +
          '%',
      }"
    ></div>
    <div
      class="dottedLine"
      :style="{
        right:
          (((day.maxEffort || 1) -
            (day.acceptableEffort || 0)) /
            (day.maxEffort || 1)) *
            100 +
          '%',
      }"
    ></div>
    <div
      class="dottedLine"
      :style="{
        right:
          (((day.maxEffort || 1) -
            (day.acceptableEffort || 0)) /
            (day.maxEffort || 1)) *
            100 +
          '%',
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/common'
import * as appState from '~/assets/app/appState'
import type { Activity } from '~/assets/app/DataStructure/Activity'
const user = appState.currentUser

const day = computed(() => {
  return user.value?.getDay(appState.focusedDate.value)
})
</script>

<style lang="scss" scoped>
.bar {
  position: relative;
  width: 100%;
  height: 40px;
  border-radius: var(--borderRadius);
  overflow: hidden;

  .bg {
    position: absolute;
    z-index: 2;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--bgD);
  }

  .fill1 {
    position: absolute;
    z-index: 4;
    left: 0;
    top: 0;
    background: var(--text);
    transition: width 0.4s;
    width: 50%;
    height: 100%;

    & > * {
      color: var(--highlight);
      display: none;
    }
  }

  .bonus {
    position: absolute;
    z-index: 3;
    right: 0;
    height: 100%;
    background-color: var(--highlight);
  }

  .dottedLine {
    position: absolute;
    z-index: 5;
    top: 0;
    height: 100%;
    border-left: 2px dashed var(--text);
    border-right: 2px dashed var(--highlight);
    transform: translateX(3px);
  }

  &.succeeded {
    .fill1 {
      & > * {
        display: block;
      }
    }
  }
}
</style>
