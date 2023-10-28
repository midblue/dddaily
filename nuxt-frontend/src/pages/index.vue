<template>
  <div>
    <div v-if="user">
      <div class="activityzone">
        <div
          class="dragContainer"
          v-for="(activity, index) in orderedActivities"
          :key="activity.id"
          :class="{
            dragMode: tempShiftIndex !== -1,
            shiftUp:
              tempShiftIndex !== -1 &&
              index > tempShiftIndex &&
              index <= tempShiftIndex + tempShiftAmount,
            shiftDown:
              tempShiftIndex !== -1 &&
              index < tempShiftIndex &&
              index >= tempShiftIndex + tempShiftAmount,
          }"
        >
          <HomeActivity
            :activity="activity"
            @tempShift="tempShift"
            @resetTempShift="resetTempShift"
          />
        </div>

        <div class="marLR martopbig marbotbig padbot">
          <div
            class="button big invert primary"
            @click="newActivity"
            style="background: var(--bg-d)"
          >
            <div class="flexcenter gapsmall">
              <img class="icon 07" src="/icons/plus.svg" />
              New Activity
            </div>
          </div>
        </div>
      </div>

      <div class="identityzone padtopbig">
        <div
          class="marRL big bold martop marbot"
          v-if="user.identities.length"
        >
          Identity Goals
        </div>

        <div
          v-for="(identity, index) in user.identities.sort(
            (a, b) => b.xp - a.xp,
          )"
        >
          <!-- <hr v-if="index !== 0" /> -->
          <HomeIdentity :identity="identity" />
        </div>

        <div class="marLR martop">
          <div
            class="button big invert primary"
            @click="newIdentity"
          >
            <div class="flexcenter gapsmall">
              <img class="icon 07" src="/icons/plus.svg" />
              New Identity Goal
            </div>
          </div>
        </div>

        <template v-if="user.identities.length === 0">
          <!-- <HomeIdentity :demo="true" /> -->

          <div
            class="flex marLR padleftbig padrightbig gapsmall martop"
          >
            <img
              class="icon o4"
              src="/icons/question.svg"
            />
            <div class="sub marnone padnone">
              <span class="bold">Identity Goals</span> track
              your progress towards who you want to be.
              Every activity you complete is a "vote"
              towards you being a Healthy Person, or a
              Polyglot, or an Engineer, or a Musician, etc.
            </div>
          </div>
        </template>
      </div>

      <HomeFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import * as appState from '~/assets/nowThis/appState'
import { createActivityData } from '~/assets/nowThis/dataManipulation/activity/createActivity'
import { createIdentityData } from '~/assets/nowThis/dataManipulation/activity/createIdentity'

const user = appState.currentUser

const orderedActivities = computed(() => {
  return user.value?.orderedActivities || []
})

const tempShiftIndex = ref<number>(-1)
const tempShiftAmount = ref<number>(-1)
function tempShift(elementIndex: number, to: number) {
  tempShiftIndex.value = elementIndex
  tempShiftAmount.value = to
}
function resetTempShift() {
  tempShiftIndex.value = -1
  tempShiftAmount.value = -1
}

function newActivity() {
  const newActivity =
    user.value?.addActivityFromConstructorData(
      createActivityData(),
      true,
    )
  if (!newActivity) return

  useRouter().push(`/activity/settings/${newActivity.id}`)
}

function newIdentity() {
  const newIdentity =
    user.value?.addIdentityFromConstructorData(
      createIdentityData({
        name: 'New Identity Goal',
      }),
      true,
    )
  if (!newIdentity) return

  useRouter().push(`/identity/settings/${newIdentity.id}`)
}
</script>

<style lang="scss" scoped>
.dragMode {
  transition: transform 0.2s ease-in-out;
}
.shiftUp {
  transform: translateY(-100%);
}
.shiftDown {
  transform: translateY(100%);
}

.identityzone {
  background: var(--bg-d2);
  padding-bottom: 30vh;
}
</style>
