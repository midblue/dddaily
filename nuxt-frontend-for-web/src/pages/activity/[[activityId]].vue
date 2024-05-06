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
          v-if="!promptDelete"
          @click="removeActivity"
        >
          Delete Activity
        </button>
        <button
          v-if="promptDelete"
          class="warning"
          @click="removeActivity"
        >
          Really??
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

const promptDelete = ref(false)
function removeActivity() {
  if (!promptDelete.value) {
    promptDelete.value = true
    return
  }
  user.value?.removeActivity(activity.value!)
  useRouter().replace(`/`)
}
</script>

<style lang="scss" scoped></style>
