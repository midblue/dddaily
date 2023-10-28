<template>
  <PageTemplate
    :key="activity.id + 'complete'"
    v-if="activity"
    class="flexcolumn flexcenter gapbig textcenter transitionslow"
    :style="{
      '--highlight': activity.hslString() || 'transparent',
      '--highlight-l':
        activity.hslString(0.2) || 'transparent',
    }"
    :class="{
      invisible: animationStage === 100,
    }"
  >
    <div
      class="xpEl fullwidth flexcolumn flexcenter marbotbig transitionslow"
      v-for="(xpEl, index) in xpRes"
      :class="{ invisible: animationStage <= index }"
      :key="'xpEl' + index"
      :style="{
        '--highlight': (xpEl.element as any).hslString?.() || 'initial',
        '--highlight-l':
          (xpEl.element as any).hslString?.(0.2) || 'initial',
      }"
    >
      <!-- <div
        v-if="xpEl.didLevelUp"
        class="caps small bold highlight fade"
      >
        Level Up!
      </div> -->

      <div class="big normal highlight">
        +{{ xpEl.totalXpGained }} XP
      </div>

      <div class="marbottiny">
        <div class="normal highlight">
          {{ xpEl.element.name }}
        </div>
      </div>

      <XPBar
        style="width: 150px"
        :element="xpEl.element"
        :animateFromXp="xpEl.previousXp"
        :waitForMs="animationMs * (index + 1) + 500"
        v-tooltip="
          `${c.r2(
            xpEl.element.totalXpInCurrentLevel *
              xpEl.element.levelProgress,
            0,
          )} / ${
            xpEl.element.totalXpInCurrentLevel
          } to level ${xpEl.element.level + 1}`
        "
      />

      <div
        class="sub multipliers martopsmall textleft transitionslow2"
        :class="{ invisible: animationStage <= index + 2 }"
      >
        <!-- <div class="flex marbottiny">
          <span class="normal" style="width: 30px">
            +{{ xpEl.element.baseXPForClear }}
          </span>
          <span>Completion XP</span>
        </div> -->
        <div
          class="flex marbottiny"
          v-for="multiplier in xpEl.multipliers"
          :key="multiplier.for + index"
        >
          <span class="normal" style="width: 30px">
            ×{{ multiplier.multiplier }}
          </span>
          <span>{{ multiplier.for }}</span>
        </div>
      </div>
    </div>

    <div
      class="martopbig transitionslow"
      v-if="appState.nextDueActivity.value"
      :class="{
        invisible: animationStage < xpRes.length + 2,
      }"
      :style="{
        '--highlight':
          appState.nextDueActivity.value.hslString() ||
          'initial',
      }"
    >
      Next up:
      <span class="highlight normal">{{
        appState.nextDueActivity.value.name
      }}</span>
    </div>

    <div
      class="martopsmall fade transitionslow"
      :class="{
        invisible: animationStage < xpRes.length + 3,
      }"
    >
      Press <kbd>space</kbd> to continue
    </div>
    <!-- <button class="sub" @click="next">next</button> -->
  </PageTemplate>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import { User } from '~/assets/nowThis/DataStructure/User'
import * as appState from '~/assets/nowThis/appState'

const activityId = useRoute().params.activityId as string
const user = appState.currentUser
const activity = computed(() =>
  user.value?.getActivityById(activityId),
)
if (!activity.value) {
  useRouter().replace(`/`)
}

let xpRes: Ref<ReturnType<User['clearActivityAndGainXp']>> =
  ref([])

onMounted(() => {
  if (!appState.currentActivity.value) {
    next()
    return
  }
  xpRes.value =
    user.value?.clearActivityAndGainXp(
      appState.currentActivity.value,
    ) || []
  if (!xpRes.value.length) return

  animateIn()

  window.addEventListener('keydown', keyListener)
})
onUnmounted(() => {
  window.removeEventListener('keydown', keyListener)
})

function next() {
  appState.goToNextDueActivity()
}

let animationMs = 400
let animationStage = ref(0)
function animateIn() {
  animationStage.value = 0
  let maxStages = 20
  let animationStageIncrementInterval: any
  setTimeout(() => {
    animationStageIncrementInterval = setInterval(() => {
      animationStage.value++
      if (animationStage.value >= maxStages) {
        clearInterval(animationStageIncrementInterval)
      }
    }, animationMs)
  }, 200)

  const nextTime =
    (xpRes.value.length + 1) * animationMs * 1.2 + 5000
  const path = useRoute().path
  setTimeout(async () => {
    if (useRoute().path !== path) return
    clearInterval(animationStageIncrementInterval)
    animationStage.value = 100
    await c.sleep(500)
    next()
  }, nextTime)
}

function keyListener(e: KeyboardEvent) {
  if (e.key === ' ') {
    // animateIn()
    e.preventDefault()
    next()
  }
}
</script>

<style lang="scss" scoped></style>
