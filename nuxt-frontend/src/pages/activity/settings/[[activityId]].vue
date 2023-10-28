<template>
  <PageTemplate
    :key="activity.id + 'settings'"
    v-if="activity"
    class="flexcolumn flexcenter gap"
    :style="{
      '--highlight': activity.hslString() || 'transparent',
    }"
  >
    <div class="flexcolumn flexcenter gapbig fullwidth">
      <div class="labeledinput">
        <label for="name">Name</label>
        <input
          class="big"
          id="name"
          v-model="activity.name"
          placeholder='i.e. "Piano"'
          @input="debouncedSave"
        />
      </div>

      <div class="labeledinput">
        <label for="color">Color</label>
        <div
          class="flex flexwrap gapsmall martopsmall"
          :key="activity.id + 'colorPicker'"
        >
          <div
            class="color"
            :class="{
              current:
                activity.hsl[0] === color[0] &&
                activity.hsl[1] === color[1] &&
                activity.hsl[2] === color[2],
            }"
            v-for="color in c.colors"
            :key="color[0]"
            :style="{
              background: `hsl(${color[0]}, ${color[1]}%, ${color[2]}%)`,
              '--usedCount': `${
                user?.activities.filter(
                  (a) =>
                    a.hsl[0] === color[0] &&
                    a.hsl[1] === color[1] &&
                    a.hsl[2] === color[2],
                ).length
              }`,
            }"
            @click="activity.hsl = color"
            v-tooltip="
              user?.activities.filter(
                (a) =>
                  a.hsl[0] === color[0] &&
                  a.hsl[1] === color[1] &&
                  a.hsl[2] === color[2],
              ).length
                ? `Used by ${c.printList(
                    user?.activities
                      .filter(
                        (a) =>
                          a.hsl[0] === color[0] &&
                          a.hsl[1] === color[1] &&
                          a.hsl[2] === color[2],
                      )
                      .map(
                        (a) =>
                          `<span style='color: ${a.hslString()}'>${
                            a.name
                          }</span>`,
                      ),
                  )}`
                : `Unused`
            "
          ></div>
        </div>
      </div>

      <div class="labeledinput">
        <label for="prompt">Prompt</label>
        <input
          id="prompt"
          v-model="activity.prompt"
          placeholder='i.e. "Did you work out today?"'
          @input="debouncedSave"
        />
      </div>

      <div class="labeledinput">
        <label for="time">Timer (in Minutes)</label>
        <input
          id="time"
          type="number"
          :step="1"
          min="1"
          v-model="activity.maxTimeInMinutes"
          placeholder="i.e. 15"
          @input="debouncedSave"
        />
      </div>

      <div class="labeledinput">
        <label for="time">Available From Hour</label>
        <div
          class="padtopsmall flexverticalcenter gapsmall"
        >
          {{ activity.availableStartHour
          }}<input
            id="time"
            type="range"
            :step="1"
            min="0"
            max="23"
            v-model="activity.availableStartHour"
            placeholder="i.e. 15"
            @input="debouncedSave"
          />
        </div>
      </div>

      <div class="labeledinput">
        <label for="time">Day interval</label>
        <div
          class="padtopsmall flexverticalcenter gapsmall"
        >
          {{ activity.clearFrequencyInDays
          }}<input
            id="time"
            type="range"
            :step="1"
            min="1"
            max="31"
            v-model="activity.clearFrequencyInDays"
            placeholder="i.e. 2"
            @input="debouncedSave"
          />
        </div>
      </div>

      <div
        class="labeledinput"
        v-if="user?.identities.length"
        :style="{
          '--highlight': 'initial',
        }"
      >
        <label class="marbotsmall"
          >Associated Identities</label
        >
        <div class="flex flexwrap">
          <button
            class="small"
            :class="{
              primary: identity.relatedActivityIds.includes(
                activity.id,
              ),
            }"
            v-for="identity in user.identities"
            @click="toggleRelatedIdentityId(identity.id)"
          >
            {{ identity.name }}
          </button>
        </div>
      </div>

      <button
        class="big primary"
        v-if="!activity.isDoneForNow"
        @click="
          useRouter().push(`/activity/${activity.id}`)
        "
      >
        Back to Activity
      </button>

      <br />
      <br />
      <br />

      <button
        class="martopbig"
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
if (!activity.value) {
  useRouter().replace(`/`)
}

watch(activity, () => {
  if (activity.value) {
    if (['Timed'].includes(activity.value.activityType)) {
      activity.value.maxTimeInMinutes = Math.ceil(
        activity.value.maxTimeInMinutes,
      )
      if (activity.value.maxTimeInMinutes < 1)
        activity.value.maxTimeInMinutes = 1
    }
  }
})

function toggleRelatedIdentityId(identityId: string) {
  const identity = user.value?.getIdentityById(identityId)
  if (!identity) return
  if (identity.relatedActivityIds.includes(activityId)) {
    identity.relatedActivityIds =
      identity.relatedActivityIds.filter(
        (id) => id !== activityId,
      )
  } else {
    identity.relatedActivityIds.push(activityId)
  }
  identity.save(['relatedActivityIds'])
}

function save() {
  const a = activity.value
  if (!a) return
  a.save()
}
const debouncedSave = c.debounce(save, 1000)
onBeforeRouteLeave((to, from, next) => {
  save()
  next()
})

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

<style lang="scss" scoped>
.color {
  position: relative;
  width: 20px;
  height: 20px;

  &.current {
    box-shadow: 0 0 0 3px var(--text);
  }

  &:not(.current) {
    transform: scale(
      calc(1 - min(0.7, var(--usedCount) * 0.3))
    );
  }
}
</style>
