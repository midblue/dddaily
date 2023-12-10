<template>
  <PageTemplate>
    <div class="flexcolumn flexcenter gap">
      <div class="flexcolumn gap fullwidth">
        <h4 class="marnone">How did you feel yesterday?</h4>
        <div class="flex nowrap">
          <div class="big">😵‍💫</div>
          <Slider
            :min="1"
            :max="10"
            :step="1"
            :initialValue="inputMood"
            @update="setMood"
          />
          <div class="big">😎</div>
        </div>
      </div>

      <div
        class="flexcolumn gap fullwidth martopbig padtopbig"
      >
        <h4 class="marnone">
          How much energy/availability do you have today?
        </h4>
        <div class="flex nowrap">
          <div class="big">🪫</div>
          <Slider
            :min="1"
            :max="10"
            :step="1"
            :initialValue="inputEnergy"
            @update="setEnergy"
          />
          <div class="big">🔋</div>
        </div>
      </div>

      <button @click="submit" class="martopbig">Ok</button>
    </div>
  </PageTemplate>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import * as appState from '~/assets/app/appState'

const user = appState.currentUser

watch(user, () => {
  useRouter().push(`/`)
})

const inputMood = ref(
  appState.currentUser.value?.yesterday?.mood || 5,
)
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
    c.addDaysToDate(new Date(), -1),
  )
  appState.currentUser.value?.setEnergy(
    inputEnergy.value / 10,
  )
  appState.currentUser.value?.assignActivitiesForDay()
  c.log(appState.currentUser.value?.today)
  appState.focusedDay.value = new Date()
  useRouter().push(
    `/day/${c.dateToDateString(appState.focusedDay.value)}`,
  )
}
</script>

<style lang="scss" scoped></style>
