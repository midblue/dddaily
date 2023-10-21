<template>
  <div v-if="user">
    <template
      v-for="activity in orderedActivities"
      :key="activity.id"
    >
      <div
        :style="{
          '--highlight': activity.hslString(),
          '--highlight-l': activity.hslString(0.2),
        }"
        class="activity"
      >
        <div
          class="bgHighlight"
          :class="{ strong: activity.progressToday < 1 }"
        ></div>
        <div>
          <nuxt-link
            :to="`/activity/${activity.id}`"
            class="highlight"
          >
            {{ activity.name }}
          </nuxt-link>
          <span class="sub marleft">{{
            c.activityTypeLabels[activity.activityType]
          }}</span>
        </div>
        <div class="flex flexverticalcenter gap">
          <ClearText :el="activity" />
        </div>
        <ClearDots :el="activity" />

        <!-- <div class="small">
            <button @click="user.removeActivity(activity)">
              remove activity
            </button>
            <button
              @click="user.moveActivity(activity, -1)"
            >
              move up
            </button>
            <button @click="user.moveActivity(activity, 1)">
              move down
            </button>
          </div> -->
      </div>
    </template>

    <nuxt-link
      class="button big invert"
      to="/activity/new"
      style="background: var(--bg-d)"
    >
      New Activity
    </nuxt-link>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import * as appState from '~/assets/nowThis/appState'
import { FlashCardActivity } from '~/assets/nowThis/DataStructure/Activities/FlashCardActivity'
import { createActivityData } from '~/assets/nowThis/dataManipulation/activity/createActivity'
import { createFlashCardData } from '~/assets/nowThis/dataManipulation/activity/createFlashCard'
import type { Activity } from '~/assets/nowThis/DataStructure/Activities/Activity'

const user = appState.currentUser

const orderedActivities = computed(() => {
  return user.value?.activityIdOrder
    .map((id) => {
      return user.value?.activities.find((a) => a.id === id)
    })
    .filter((a) => a) as Activity[]
})

function addFlashCard(activity: FlashCardActivity) {
  activity.addCardFromConstructorData(
    createFlashCardData({
      front: 'from frontend',
      back: 'asdf',
    }),
    true,
  )
}
</script>

<style lang="scss">
.activity {
  position: relative;
  padding: 1rem var(--pagePadLr);

  .bgHighlight {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.15;
    background: linear-gradient(
      120deg,
      var(--highlight) 0%,
      transparent 10%
    );
    z-index: -1;

    &.strong {
      opacity: 0.3;
      background: linear-gradient(
        120deg,
        var(--highlight) 0%,
        transparent 40%
      );
    }
  }
}
</style>
