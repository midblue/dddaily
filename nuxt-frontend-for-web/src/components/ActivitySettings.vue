<template>
  <div
    class="flexgrow flexcolumn flexhorizcenter gapbig fullwidth fullheight"
  >
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

    <div>
      <div
        v-if="
          activity.timer ||
          activity.inspiration ||
          showMoreOptions
        "
      >
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

        <div class="labeledinput martopbig">
          <label for="inspiration">Inspiration</label>
          <textarea
            class="inspiration"
            v-model="activity.inspiration"
            placeholder="What kinds of subtasks or variations could you do?"
            @input="debouncedSave"
          ></textarea>
        </div>
      </div>

      <div
        class="flexcenter martopsmall"
        v-if="!activity.inspiration && !activity.timer"
      >
        <button
          @click="showMoreOptions = !showMoreOptions"
          class="secondary"
        >
          {{ showMoreOptions ? 'Less' : 'More' }} Options
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import * as appState from '~/assets/app/appState'
import type { Activity } from '~/assets/app/DataStructure/Activity'
const user = appState.currentUser

const showMoreOptions = ref(false)

const props = defineProps({
  activity: {
    type: Object as PropType<Activity>,
    required: true,
  },
})

if (!props.activity) {
  useRouter().replace(`/`)
}

function setEnergy(energy: number) {
  props.activity!.effortRequired = energy / 10
  debouncedSave()
}
function setMoodLowLimit(mood: number) {
  props.activity!.moodLowLimit = mood / 10
  debouncedSave()
}
function setMoodHighLimit(mood: number) {
  props.activity!.moodHighLimit = mood / 10
  debouncedSave()
}

function setTimer(timer: number) {
  props.activity!.timer = timer || null
  debouncedSave()
}

function setExact(exact: boolean) {
  props.activity!.exact = exact
  debouncedSave()
}
function setDayInterval(dayInterval: number) {
  props.activity!.dayInterval = dayInterval
  debouncedSave()
}

function save() {
  const existsOnUser = user.value?.activities.includes(
    props.activity!,
  )
  if (!existsOnUser) return
  const a = props.activity
  if (!a) return
  a.save()
}

const debouncedSave = c.debounce(save, 1000)
onBeforeRouteLeave((to, from, next) => {
  if (user.value?.activities.includes(props.activity!)) {
    save()
  }
  next()
})
</script>

<style lang="scss" scoped></style>
