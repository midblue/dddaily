<template>
  <div
    class="cdfa nopointer"
    v-if="activity"
    :style="{
      '--highlight': activity.hslString(),
      '--highlight-l': activity.hslString(0.15),
    }"
  >
    <ClearDots :el="activity" class="marbottiny" />

    <div class="flex flexverticalcenter gap">
      <ClearText :el="activity" />
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
</script>

<style lang="scss" scoped>
.cdfa {
  max-width: 100%;
  overflow: hidden;
}
</style>
