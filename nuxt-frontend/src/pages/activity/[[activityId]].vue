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

      <div class="labeledinput">
        <label for="name">Name</label>
        <input
          class="big padtopnone padbotnone"
          id="name"
          v-model="activity.name"
          placeholder='i.e. "Piano"'
          @input="debouncedSave"
        />
      </div>

      <div class="labeledinput">
        <label for="time"
          >When:
          <template
            v-if="
              activity.exact && activity.dayInterval === 1
            "
          >
            Every single day</template
          >
          <template v-else>
            {{ activity.exact ? 'Exactly' : 'About' }}
            every
            {{
              activity.dayInterval === 1
                ? ''
                : activity.dayInterval + ' '
            }}day{{
              activity.dayInterval === 1 ? '' : 's'
            }}</template
          ></label
        >
        <div class="martoptiny">
          <button
            :class="{ primary: activity.exact }"
            @click="setExact(true)"
          >
            Exactly
          </button>
          <button
            :class="{ primary: !activity.exact }"
            @click="setExact(false)"
          >
            About
          </button>
        </div>
        <div class="flexcenter gap martoptiny">
          <Slider
            :line="true"
            :exponentialScale="true"
            :min="1"
            :max="90"
            :step="1"
            :initialValue="activity.dayInterval || 1"
            @update="setDayInterval"
          />
        </div>
      </div>

      <div class="labeledinput">
        <label for="time">Energy/Time Required</label>
        <div class="flexcenter gaptiny martopsmall">
          <div
            class="big"
            :style="{
              transform: `scale(${
                1 - activity.effortRequired + 0.5
              })`,
            }"
          >
            🤏
          </div>
          <Slider
            :min="0"
            :max="10"
            :step="1"
            :initialValue="activity.effortRequired * 10"
            @update="setEnergy"
          />
          <div
            class="big"
            :style="{
              transform: `scale(${
                activity.effortRequired + 0.5
              })`,
            }"
          >
            🏋️‍♂️
          </div>
        </div>
      </div>

      <div class="labeledinput" v-if="!activity.exact">
        <label for="time"
          >I want to do this when I feel...</label
        >
        <div class="flexcenter gaptiny martopsmall">
          <div
            class="big"
            :style="{
              transform: `scale(${
                1 -
                (activity.moodLowLimit +
                  activity.moodHighLimit) /
                  2 +
                0.5
              })`,
            }"
          >
            😵‍💫
          </div>
          <Slider
            :range="true"
            :min="1"
            :max="10"
            :step="1"
            :initialValue="activity.moodLowLimit * 10"
            :initialUpperValue="activity.moodHighLimit * 10"
            @update="setMoodLowLimit"
            @updateUpper="setMoodHighLimit"
          />
          <div
            class="big"
            :style="{
              transform: `scale(${
                (activity.moodLowLimit +
                  activity.moodHighLimit) /
                  2 +
                0.5
              })`,
            }"
          >
            😎
          </div>
        </div>
      </div>

      <div class="labeledinput">
        <label for="time"
          >Timer:
          <span>{{
            !activity.timer ||
            !parseInt(`${activity.timer}`)
              ? 'Off'
              : activity.timer + ' minutes'
          }}</span></label
        >
        <div class="flexcenter gap martopsmall">
          <Slider
            :line="true"
            :exponentialScale="true"
            :min="0"
            :max="120"
            :step="1"
            :initialValue="activity.timer || 0"
            @update="setTimer"
          />
        </div>
      </div>

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

function setEnergy(energy: number) {
  activity.value!.effortRequired = energy / 10
  debouncedSave()
}
function setMoodLowLimit(mood: number) {
  activity.value!.moodLowLimit = mood / 10
  debouncedSave()
}
function setMoodHighLimit(mood: number) {
  activity.value!.moodHighLimit = mood / 10
  debouncedSave()
}

function setTimer(timer: number) {
  activity.value!.timer = timer || null
  debouncedSave()
}

function setExact(exact: boolean) {
  activity.value!.exact = exact
  debouncedSave()
}
function setDayInterval(dayInterval: number) {
  activity.value!.dayInterval = dayInterval
  debouncedSave()
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

<style lang="scss" scoped></style>
