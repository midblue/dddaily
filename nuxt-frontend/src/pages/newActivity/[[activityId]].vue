<template>
  <div
    v-if="activity"
    class="flexgrow flexcolumn fullheight"
  >
    <div
      class="flexgrow flexcolumn flexhorizcenter gapbig fullwidth fullheight padbig"
    >
      <div>
        <nuxt-link :to="'/'" class="back"
          ><img src="/icons/back.svg"
        /></nuxt-link>
      </div>

      <ActivitySettings :activity="activity" />

      <div class="flexcenter martopbig padtopbig">
        <button
          @click="removeActivity"
          class="warning small"
        >
          Delete
        </button>
        <button @click="goHome" class="small">Done</button>
        <button
          @click="addAnotherActivity"
          class="small primary"
        >
          Add Another
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import * as appState from '~/assets/app/appState'

const activityId = useRoute().params.activityId as string
const user = appState.currentUser
const activity = computed(() =>
  user.value?.getActivityById(activityId),
)

if (!activity.value) {
  useRouter().replace(`/`)
}

function removeActivity() {
  user.value?.removeActivity(activity.value!)
  useRouter().replace(`/`)
}

function addAnotherActivity() {
  const newActivity =
    user.value?.addActivityFromConstructorData(
      {
        name: 'New Activity',
        id: c.id('Activity'),
        type: 'Activity',
      },
      true,
    )
  if (!newActivity) return

  useRouter().push(`/newActivity/${newActivity.id}`)
}

function goHome() {
  useRouter().push(`/`)
}
</script>

<style lang="scss" scoped></style>
