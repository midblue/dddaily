<template>
  <div v-if="user?.dailyActivities.length">
    <div class="barHolder">
      <nuxt-link
        :to="`/activity/${a.id}`"
        v-for="a in user.dailyActivities"
        :key="'da' + a.id + a.estimatedTimeInMinutes"
        class="activityBar"
        :class="{ done: a.progressToday === 1 }"
        :style="{
          '--highlight': a.hslString(),
          '--highlight-l': a.hslString(0.5),
          'flex-grow': a.estimatedTimeInMinutes,
        }"
        v-tooltip="a.name"
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
          v-if="a.progressToday === 1"
        ></div>
      </nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import * as appState from '~/assets/nowThis/appState'

const user = appState.currentUser
</script>

<style lang="scss">
.barHolder {
  display: flex;
  width: 100%;
  gap: 2px;
  height: 1em;
  align-items: center;

  .activityBar {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;

    .bg {
      position: absolute;
      width: 100%;
      background-color: var(--highlight-l);
      height: 100%;
    }
    .progress {
      height: 100%;
      background-color: var(--highlight);
    }

    &.done {
      & > * {
        height: 20%;
      }

      .progress {
        display: none;
      }
    }

    .check {
      width: 100%;

      &::before {
        color: white; //var(--text);
        font-weight: 900;
        content: '✓';
        line-height: 1;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 1em;
        height: 1em;
        padding: 0 0 0 1px;
        border-radius: 50%;
        background-color: var(--highlight);
      }
    }
  }
}
</style>
