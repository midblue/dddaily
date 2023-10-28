<template>
  <div v-if="todaysActivities.length">
    <div class="barHolder">
      <nuxt-link
        :to="`/activity/${a.id}`"
        v-for="a in todaysActivities"
        :key="'da' + a.id + a.estimatedTimeInMinutes"
        class="activityBar"
        :class="{
          done:
            a.isDoneForNow &&
            !a.skipToday &&
            a.postponeUntil === null,
          current: a === appState.currentActivity.value,
          skip: a.skipToday,
        }"
        :style="{
          '--highlight': a.hslString(),
          '--highlight-l': a.hslString(0.6),
          'flex-grow': a.estimatedTimeInMinutes,
        }"
        v-tooltip="
          `${a.name}${
            a.isDoneForNow &&
            !a.skipToday &&
            a.postponeUntil === null
              ? ': Done'
              : a.skipToday
              ? ': Skipped for today'
              : a.postponeUntil
              ? ': Postponed until ' +
                new Date(
                  a.postponeUntil,
                ).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                })
              : ''
          }`
        "
      >
        <div class="bg"></div>
        <div
          class="progress flexcenter"
          :style="{
            width: a.progressToday * 100 + '%',
          }"
        ></div>
        <div
          class="check"
          v-if="
            a.isDoneForNow &&
            !a.skipToday &&
            a.postponeUntil === null
          "
        ></div>
        <div class="skip" v-if="a.skipToday"></div>
      </nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import type { Activity } from '~/assets/nowThis/DataStructure/Activities/Activity'
import * as appState from '~/assets/nowThis/appState'

const user = appState.currentUser

let todaysActivities = ref<Activity[]>([])
watch(user, resetTodaysActivities)
watch(
  () => user.value?.nextDueActivity,
  resetTodaysActivities,
)
watch(
  () => user.value?.activityIdOrder,
  resetTodaysActivities,
)
onMounted(resetTodaysActivities)
function resetTodaysActivities() {
  todaysActivities.value =
    user.value?.todaysActivities || []
}
</script>

<style lang="scss" scoped>
.barHolder {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  gap: 0.5em 2px;
  padding-top: 0.2em;
  padding-bottom: 0.2em;
  align-items: center;

  .activityBar {
    --baseHeight: 0.8em;
    position: relative;
    height: var(--baseHeight);
    display: flex;
    align-items: center;
    min-width: 0.1em;

    .bg {
      position: absolute;
      width: 100%;
      background-color: var(--highlight-l);
      border-radius: var(--borderRadius);
    }
    .progress {
      position: absolute;
      background-color: var(--highlight);
      border-radius: var(--borderRadius);
    }

    .bg,
    .progress {
      height: 50%;
    }

    &.done {
      // flex-grow: 1 !important;
      .bg,
      .progress {
        height: 30%;
      }
      .progress {
        display: none;
      }
      .bg {
        opacity: 0.3;
      }
    }

    &.current {
      height: var(--baseHeight);

      .bg,
      .progress {
        height: 100%;
      }
    }

    &.skip {
      .bg {
        opacity: 0.3;
      }
      .progress {
        opacity: 0.5;
      }
      .bg,
      .progress {
        height: 30%;
      }
    }

    // .check,
    .skip {
      width: 100%;

      &::after {
        z-index: 3;
        color: rgba(255, 255, 255, 0.8); //var(--text);
        font-weight: 900;
        content: '✓';
        font-size: 0.85em;
        line-height: 1;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }

      &::before {
        z-index: 2;
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 0.6em;
        height: 0.6em;
        padding: 0 0 0 1px;
        border-radius: 50%;
        background-color: var(--highlight);
      }
    }

    .skip {
      &::after {
        font-weight: 500;
        content: '×';
      }
      &::before {
        display: none;
      }
    }
  }
}
</style>
