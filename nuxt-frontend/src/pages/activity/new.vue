<template>
  <PageTemplate>
    new activity

    <button @click="addActivity('CheckIn')">
      add CheckIn
    </button>

    <button @click="addActivity('FlashCard')">
      add FlashCard Activity
    </button>
  </PageTemplate>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import * as appState from '~/assets/nowThis/appState'
import { createActivityData } from '~/assets/nowThis/dataManipulation/activity/createActivity'
import type { Activity } from '~/assets/nowThis/DataStructure/Activities/Activity'

const user = appState.currentUser

function addActivity(type: ActivityType) {
  user.value?.addActivityFromConstructorData(
    createActivityData({
      activityType: type,
      prompt: 'prompt',
    }),
    true,
  )
}
</script>

<style lang="scss"></style>
