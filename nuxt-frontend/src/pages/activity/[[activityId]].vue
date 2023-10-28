<template>
  <PageTemplate
    :key="activity.id"
    v-if="activity"
    class="flexcolumn flexcenter flexbetween gapbig textcenter"
    :style="{
      '--highlight': activity.hslString() || 'transparent',
      '--highlight-l':
        activity.hslString(0.2) || 'transparent',
    }"
  >
    <ActivityCheckIn
      v-if="activity.functionalActivityType === 'CheckIn'"
    />

    <ActivityTimed
      v-if="activity.functionalActivityType === 'Timed'"
    />
  </PageTemplate>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import * as appState from '~/assets/nowThis/appState'

const activityId = useRoute().params.activityId as string
const user = appState.currentUser
const activity = computed(() =>
  user.value?.getActivityById(activityId),
)

const couldStillBeDoneToday = computed(
  () => activity.value?.couldStillBeDoneToday,
)

if (!couldStillBeDoneToday.value) {
  useRouter().replace(`/activity/settings/${activityId}`)
}
onMounted(() => {
  if (activity.value && activity.value.skipToday) {
    activity.value.skipToday = false
  }
  if (activity.value && activity.value.postponeUntil) {
    activity.value.postponeUntil = null
  }
})
</script>

<style lang="scss" scoped></style>
