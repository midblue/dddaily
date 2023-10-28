<template>
  <div
    class="maincontent flexcolumn flexcenter gap fullwidth"
    v-if="activity"
  >
    <div class="big normal highlight">
      <span v-if="activity.prompt">
        {{ activity.prompt }}
      </span>
      <span v-else>
        {{ activity.name }}
      </span>
    </div>

    <span
      class="big"
      v-if="msRemaining > 0"
      :class="{ fade2: paused }"
      >{{ c.msToTimeString(msRemaining) }} left</span
    >
    <span class="big" v-else>Done!</span>

    <div class="progressbar">
      <div
        class="progress"
        :style="`width: ${progress * 100}%`"
      ></div>
    </div>
    <div class="flex gapsmall">
      <button class="iconbutton" @click="resetTimer">
        <img src="/icons/restart-white.svg" />
      </button>
      <button
        class="iconbutton"
        v-if="!paused"
        @click="pauseTimer"
      >
        <img src="/icons/pause-white.svg" />
      </button>
      <button
        class="primary iconbutton"
        v-if="paused && msRemaining > 0"
        @click="startTimer"
      >
        <img src="/icons/play-white.svg" />
      </button>
    </div>
  </div>

  <div
    class="bottom fullpage flexcolumn flexcenter gapsmall"
  >
    <ActivityClearDataForActivity />
    <button
      :class="{ primary: msRemaining <= 0 }"
      class="big martop"
      @click="clearAndGainXp"
    >
      Done
    </button>
    <div class="flex gapsmall">
      <button
        v-if="!activity?.isDoneForNow"
        @click="appState.skipCurrentActivityForToday"
      >
        Skip today
      </button>
      <button
        v-if="!activity?.isDoneForNow"
        @click="appState.postponeCurrentActivity(2)"
      >
        Do this later
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import * as appState from '~/assets/nowThis/appState'

const activityId = useRoute().params.activityId as string
const user = appState.currentUser
const activity = computed(() =>
  user.value?.getActivityById(activityId),
)

const paused = ref(false)
const maxTimeInMs = computed(
  () =>
    (activity.value?.maxTimeInMinutes || Infinity) *
    60 *
    1000,
)

const progress = computed(() => {
  if (!activity.value) return 0
  return (
    activity.value.timeSpentTodayInMs / maxTimeInMs.value
  )
})

const msRemaining = computed(() => {
  if (!activity.value) return 0
  return (
    maxTimeInMs.value - activity.value.timeSpentTodayInMs
  )
})

let timerInterval: any
let saveInterval: any
function startTimer() {
  paused.value = false
  if (timerInterval) return
  timerInterval = setInterval(() => {
    if (!activity.value) return
    activity.value.timeSpentTodayInMs += 100
    if (
      activity.value.timeSpentTodayInMs >= maxTimeInMs.value
    )
      onTimerDone()
  }, 100)
  saveInterval = setInterval(() => {
    activity.value?.save(['timeSpentTodayInMs'])
  }, 10 * 1000)
}
function pauseTimer() {
  paused.value = true
  clearInterval(timerInterval)
  clearInterval(saveInterval)
  timerInterval = null
}
function resetTimer() {
  if (!activity.value) return
  activity.value.timeSpentTodayInMs = 0
  activity.value.save(['timeSpentTodayInMs'])
}

onMounted(() => {
  if (activity.value?.postponeUntil) {
    activity.value.postponeUntil = null
  }

  const autoStart =
    appState.userIsProbablyActivelyUsingApp.value
  if (autoStart) startTimer()
})

function onTimerDone() {
  if (!activity.value) return
  pauseTimer()
}

function clearAndGainXp() {
  pauseTimer()
  if (!activity.value) return
  activity.value.timeSpentTodayInMs = maxTimeInMs.value
  appState.activityComplete()
}

onBeforeUnmount(() => {
  pauseTimer()
})

// * key listeners
onMounted(() => {
  window.addEventListener('keydown', keyListener)
})
onUnmounted(() => {
  window.removeEventListener('keydown', keyListener)
})
function keyListener(e: KeyboardEvent) {
  if (e.key === ' ') {
    e.preventDefault()
    if (
      (activity.value?.timeSpentTodayInMs || 0) >=
      maxTimeInMs.value
    ) {
      clearAndGainXp()
      return
    }

    if (paused.value) startTimer()
    else pauseTimer()
  }
}
</script>

<style lang="scss" scoped>
.progressbar {
  width: 100%;
  max-width: 15em;
  height: 10px;
  background: var(--highlight-l);
  overflow: hidden;
  margin-bottom: 10px;

  .progress {
    height: 100%;
    background: var(--highlight);
  }
}
.bottom {
  position: relative;
  padding: 3em 2em;

  & > * {
    position: relative;
    z-index: 1;
  }

  &:before {
    content: '';
    position: absolute;
    background: var(--bg-d);
    top: 0;
    bottom: -100px;
    left: 0;
    right: 0;
    z-index: -1;
  }
}
</style>
