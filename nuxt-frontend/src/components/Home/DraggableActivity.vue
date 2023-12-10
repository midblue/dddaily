<template>
  <div
    class="homeActivity flexverticalcenter"
    ref="mainBar"
    :style="{
      '--dragOffset': `${dragOffset}px`,
    }"
    :class="{
      dragging,
    }"
  >
    <div class="right flexcenter gap">
      <div
        class="dragHandle clickableIconHolder"
        @mousedown.prevent="startDrag"
      >
        <img class="o3" src="/icons/grabHandle.svg" />
      </div>
    </div>

    <div
      @click="useRouter().push(`/activity/${activity.id}`)"
      class="nowrap"
    >
      <span>{{ activity.name }}</span>
      <span class="small marleftsmall">
        <!-- 🗓️-->{{ activity.exact ? '' : '~'
        }}{{
          c.msToTimeString(
            activity.dayInterval * 1000 * 60 * 60 * 24,
          )
        }}
        <!-- <span class="fade2">・</span>
        {{
          activity.effortRequired > 0.5
            ? '🏋️‍♂️'
            : activity.effortRequired > 0.25
            ? '💪'
            : '🤏'
        }}
        <span class="fade2">・</span>
        {{
          (activity.moodHighLimit + activity.moodLowLimit) /
            2 >
          0.6
            ? '😎'
            : (activity.moodHighLimit +
                activity.moodLowLimit) /
                2 >
              0.4
            ? '🙂'
            : '😵‍💫'
        }} -->
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import * as appState from '~/assets/app/appState'
import type { Activity } from '~/assets/app/DataStructure/Activity'
const user = appState.currentUser

const { activity } = defineProps({
  activity: {
    type: Object as PropType<Activity>,
    required: true,
  },
})

// * drag setup

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
.dragging {
  position: relative;
  box-shadow: 0 1em 1em rgba(0, 0, 0, 0.2);
  transform: scale(1.02) rotate(1deg)
    translateY(var(--dragOffset));
  z-index: 3;
}

.dragHandle {
  cursor: grab;
  pointer-events: auto;
}
</style>
