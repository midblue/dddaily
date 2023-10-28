<template>
  <div
    class="maincontent flexcolumn flexcenter gap fullwidth"
    v-if="activity"
  >
    <span v-if="activity.prompt" class="big marbotbig">
      {{ activity.prompt }}
    </span>
    <span v-else class="big marbotbig">
      Did you {{ activity.name.toLowerCase() }} today?
    </span>
    <button class="primary big" @click="clearAndGainXp">
      Yes
    </button>
    <div class="flex gapsmall">
      <button
        @click="appState.skipCurrentActivityForToday()"
      >
        Not today
      </button>
      <button
        v-if="!activity?.isDoneForNow"
        @click="appState.postponeCurrentActivity(2)"
      >
        Ask me later
      </button>
    </div>
  </div>
  <div class="padbotbig fullpage">
    <ActivityClearDataForActivity class="marL" />
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

function clearAndGainXp() {
  appState.activityComplete()
}

// * key listeners
onMounted(() => {
  window.addEventListener('keydown', keyListener)
})
onUnmounted(() => {
  window.removeEventListener('keydown', keyListener)
})
function keyListener(e: KeyboardEvent) {
  if (e.key === ' ') {
    clearAndGainXp()
  }
}
</script>

<style lang="scss" scoped></style>
