<template>
  <PageTemplate>
    studying...
    {{ activity?.getSaveableData() }}
  </PageTemplate>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import * as appState from '~/assets/nowThis/appState'
import type { Activity } from '~/assets/nowThis/DataStructure/Activities/Activity'

const activityId = useRoute().params.activityId as string
const user = appState.currentUser
const activity = computed(() =>
  user.value?.getActivityById(activityId),
)
</script>

<style lang="scss"></style>
