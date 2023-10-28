<template>
  <PageTemplate
    v-if="identity && user"
    class="flexcolumn flexcenter gap"
  >
    <div class="flexcolumn flexcenter gapbig fullwidth">
      <div class="labeledinput">
        <label for="name">Name</label>
        <input
          class="big"
          id="name"
          v-model="identity.name"
          placeholder='i.e. "Polyglot"'
          @input="debouncedSave"
        />
      </div>

      <div class="labeledinput">
        <label class="marbotsmall"
          >Associated Activites</label
        >
        <div class="flex flexstretch flexwrap">
          <button
            :class="{
              primary: identity.relatedActivityIds.includes(
                activity.id,
              ),
            }"
            v-for="activity in user.orderedActivities"
            @click="toggleRelatedActivityId(activity.id)"
          >
            {{ activity.name }}
          </button>
        </div>
      </div>

      <br />
      <br />
      <br />

      <button
        class="martopbig"
        v-if="!promptDelete"
        @click="removeIdentity"
      >
        Delete Identity Goal
      </button>
      <button
        v-if="promptDelete"
        class="warning"
        @click="removeIdentity"
      >
        Really??
      </button>
    </div>
  </PageTemplate>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import * as appState from '~/assets/nowThis/appState'

const identityId = useRoute().params.identityId as string
const user = appState.currentUser
const identity = computed(() =>
  user.value?.getIdentityById(identityId),
)
// if (!identity.value) {
//   useRouter().replace(`/`)
// }

function toggleRelatedActivityId(activityId: string) {
  if (
    identity.value!.relatedActivityIds.includes(activityId)
  ) {
    identity.value!.relatedActivityIds =
      identity.value!.relatedActivityIds.filter(
        (id) => id !== activityId,
      )
  } else {
    identity.value!.relatedActivityIds.push(activityId)
  }
  identity.value!.save(['relatedActivityIds'])
}

function save() {
  const a = identity.value
  if (!a) return
  a.save()
}
const debouncedSave = c.debounce(save, 1000)
onBeforeRouteLeave((to, from, next) => {
  identity.value?.dailyReset()
  save()
  next()
})

const promptDelete = ref(false)
function removeIdentity() {
  if (!promptDelete.value) {
    promptDelete.value = true
    return
  }
  user.value?.removeIdentity(identity.value!)
  useRouter().replace(`/`)
}
</script>

<style lang="scss" scoped></style>
