<template>
  <PageTemplate>
    <div class="flexcolumn flexcenter gap">
      <div class="flexcolumn gap fullwidth">
        <h4 class="marnone">How did you feel yesterday?</h4>
        <div class="flex nowrap">
          <div
            class="big"
            :style="{
              transform: `scale(${
                1 - inputMood / 10 + 0.5
              })`,
            }"
          >
            😵‍💫
          </div>
          <Slider
            :min="1"
            :max="10"
            :step="1"
            :initialValue="inputMood"
            @update="setMood"
          />
          <div
            class="big"
            :style="{
              transform: `scale(${inputMood / 10 + 0.5})`,
            }"
          >
            😎
          </div>
        </div>
      </div>

      <div
        class="flexcolumn gap fullwidth martopbig padtopbig"
      >
        <h4 class="marnone">
          How much energy/availability do you have today?
        </h4>
        <div class="flex nowrap">
          <div
            class="big"
            :style="{
              transform: `scale(${
                1 - inputEnergy / 10 + 0.5
              })`,
            }"
          >
            🪫
          </div>
          <Slider
            :min="1"
            :max="10"
            :step="1"
            :initialValue="inputEnergy"
            @update="setEnergy"
          />
          <div
            class="big"
            :style="{
              transform: `scale(${inputEnergy / 10 + 0.5})`,
            }"
          >
            🔋
          </div>
        </div>
      </div>

      <button @click="submit" class="martopbig">Ok</button>
    </div>
  </PageTemplate>
</template>

<script setup lang="ts">
import * as c from '~/common'
import * as appState from '~/assets/app/appState'

const user = appState.currentUser

watch(user, () => {
  // * routing logic handled in index
  useRouter().replace(`/`)
})

const inputMood = ref(5)
function setMood(mood: number) {
  inputMood.value = mood
}

const inputEnergy = ref(5)
function setEnergy(energy: number) {
  inputEnergy.value = energy
}

function submit() {
  appState.currentUser.value?.setMood(
    inputMood.value / 10,
    c.addDaysToDate(null, -1), // yesterday
  )
  appState.currentUser.value?.setEnergy(
    inputEnergy.value / 10,
  )
  appState.currentUser.value?.assignActivitiesForDay()
  appState.focusedDay.value = c.dateToDateString()
  c.log('moodCheck result:', {
    mood: appState.currentUser.value?.yesterday?.mood,
    energy: appState.currentUser.value?.today?.energy,
    focusedDay: appState.focusedDay.value,
    today: JSON.parse(
      JSON.stringify(
        appState.currentUser.value?.today || {},
      ),
    ),
  })
  useRouter().push(`/day/${appState.focusedDay.value}`)
}
</script>

<style lang="scss" scoped></style>
