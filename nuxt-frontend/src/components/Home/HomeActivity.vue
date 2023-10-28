<template>
  <div
    :style="{
      '--highlight': activity.hslString(),
      '--highlight-l': activity.hslString(0.15),
      '--dragOffset': `${dragOffset}px`,
    }"
    class="activity"
    ref="mainBar"
    :class="{
      couldBeDone: activity.couldStillBeDoneToday,
      dragging,
    }"
  >
    <div
      class="bgHighlight"
      :class="{ strong: activity.isDue }"
    ></div>

    <div class="right flexcenter gap">
      <div
        class="dragHandle clickableIconHolder"
        @mousedown.prevent="startDrag"
      >
        <img class="o3" src="/icons/grabHandle.svg" />
      </div>
    </div>

    <nuxt-link
      class="linkZone"
      :to="
        activity.couldStillBeDoneToday
          ? `/activity/${activity.id}`
          : `/activity/settings/${activity.id}`
      "
    >
      <div>
        <span class="highlight">
          {{ activity.name }}
        </span>
        <span class="sub marleft">{{
          activity.postponeUntil &&
          activity.postponeUntil > c.dateToDateTimeString()
            ? `At ${new Date(
                activity.postponeUntil,
              ).toLocaleTimeString('en-US', {
                hour: 'numeric',
              })}`
            : (activity.availableStartHour || 0) >
              new Date().getHours()
            ? `At ${c.hour24ToHour12(
                activity.availableStartHour,
              )}`
            : activity.functionalActivityType === 'Timed'
            ? `${activity.maxTimeInMinutes} minutes`
            : c.activityTypeLabels[
                activity.functionalActivityType
              ]
        }}</span>
      </div>

      <ClearDots
        :el="activity"
        style="margin-bottom: 2px"
      />

      <div class="flex flexverticalcenter gap">
        <ClearText :el="activity" />
      </div>
    </nuxt-link>

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

<script setup lang="ts">
import * as c from '~/../../common'
import type { Activity } from '~/assets/nowThis/DataStructure/Activities/Activity'
import * as appState from '~/assets/nowThis/appState'

const user = appState.currentUser
const { activity } = defineProps({
  activity: {
    type: Object as PropType<Activity>,
    required: true,
  },
})

const mainBar = ref<HTMLElement | null>(null)

const emit = defineEmits<{
  (e: 'tempShift', from: number, to: number): void
  (e: 'resetTempShift'): void
}>()

const dragging = ref(false)
const dragStartY = ref(0)
const dragOffset = ref(0)
let elHeight = 0

function startDrag(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  dragging.value = true
  window.addEventListener('mousemove', drag)
  window.addEventListener('mouseup', endDrag)
  window.addEventListener('mouseleave', endDrag)
  dragStartY.value = e.clientY
  elHeight = mainBar?.value?.offsetHeight ?? 100
}

function drag(e: MouseEvent) {
  if (!dragging.value) return
  const orderIndex =
    user.value?.getActivityOrderIndex(activity) ?? -1
  if (orderIndex === -1) return
  const diff = dragStartY.value - e.clientY
  dragOffset.value = -diff
  const diffInEls = Math.round(-diff / elHeight)
  emit('tempShift', orderIndex, diffInEls)
}

function endDrag(e?: MouseEvent) {
  if (!dragging.value) return
  e?.preventDefault()
  e?.stopPropagation()
  dragging.value = false
  window.removeEventListener('mousemove', drag)
  window.removeEventListener('mouseup', endDrag)
  window.removeEventListener('mouseleave', endDrag)

  const diff = dragStartY.value - (e?.clientY || 0)
  const diffInEls = Math.round(-diff / elHeight)
  user.value?.moveActivity(activity, diffInEls)
  emit('resetTempShift')

  dragOffset.value = 0
}
</script>

<style lang="scss" scoped>
.activity {
  background-color: var(--bg);
  display: block;
  position: relative;
  font-weight: 500;
  box-shadow: 0 0 0 rgba(0, 0, 0, 0.2);
  transition: box-shadow 0.1s ease-in-out,
    transform 0.1s ease-in-out;
  top: var(--dragOffset);
  z-index: 1;

  &:hover {
    z-index: 2;
  }

  .linkZone {
    padding: 1rem 0 1rem var(--pagePadLr);
    display: block;
    color: var(--text);
  }

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: -3px;
    width: 3px;
    height: 100%;
    background: var(--highlight);
    transition: left 0.2s ease-in-out;
  }

  &.couldBeDone {
    &:after {
      left: 0;
    }
  }

  &.dragging {
    box-shadow: 0 1em 1em rgba(0, 0, 0, 0.2);
    transform: scale(1.02) rotate(1deg);
    z-index: 3;
  }

  .bgHighlight {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.2;
    background: linear-gradient(
      110deg,
      var(--highlight) 0%,
      transparent 10%
    );
    z-index: -1;

    &.strong {
      opacity: 0.2;
      background: linear-gradient(
        110deg,
        var(--highlight) 0%,
        transparent 35%
      );
    }
  }

  &:hover {
    &:before {
      pointer-events: none;
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--highlight);
      opacity: 0.1;
    }
  }
}

.right {
  position: absolute;
  z-index: 3;
  right: 0;
  top: 0;
  height: 100%;
  padding: 0 0.8em 0 3em;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.9) 50%
  );
  pointer-events: none;

  .dragHandle {
    cursor: grab;
    pointer-events: auto;
  }
}
</style>
