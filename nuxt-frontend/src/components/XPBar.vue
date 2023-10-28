<template>
  <div
    class="flexverticalcenter"
    :style="{
      '--animateSpeed': `${animateSpeedMs}ms`,
      '--animateEase': animateEase,
    }"
  >
    <div
      class="level bold highlight relative"
      v-if="!hideLevel"
    >
      {{ displayLevel }}
      <div class="poof" ref="levelPoof" />
    </div>

    <div class="xpbarholder">
      <div class="bg"></div>
      <div
        class="progress"
        :style="{
          width: `${displayProgress * 100}%`,
        }"
      ></div>
      <div
        class="newprogress"
        v-if="
          animateFromXp !== undefined && !hideNewProgress
        "
        :style="{
          width: `100%`,
          left: `${c.levelProgress(animateFromXp) * 100}%`,
        }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import type { ClearableWithXP } from '~/assets/nowThis/DataStructure/BaseClasses/ClearableWithXP'
import * as appState from '~/assets/nowThis/appState'

const user = appState.currentUser

const { element, animateFromXp, waitForMs, hideLevel } =
  defineProps<{
    element: ClearableWithXP
    animateFromXp?: number
    waitForMs?: number
    hideLevel?: boolean
  }>()

let displayXp = ref(animateFromXp ?? element.xp)
let displayProgress = computed(() =>
  c.levelProgress(displayXp.value),
)
let displayLevel = computed(() =>
  c.xpToLevel(displayXp.value),
)
let hideNewProgress = ref(false)

const loopForever = false
let i: any
onMounted(() => {
  animate()
  if (loopForever) i = setInterval(animate, 5000)
})
onUnmounted(() => clearInterval(i))

const baseSpeed = 1000
const minSpeed = 300
const animateSpeedMs = ref(baseSpeed)
const animateEase = ref('ease-in-out')
const animationComplete = ref(false)
const levelPoof: Ref<HTMLElement | null> = ref(null)

async function animate() {
  if (animateFromXp === undefined) return
  if (waitForMs) await c.sleep(waitForMs)

  // reset
  levelPoof.value?.classList.remove('play')
  animationComplete.value = false
  animateSpeedMs.value = 0
  hideNewProgress.value = false
  await nextTick()
  displayXp.value = animateFromXp
  await nextTick()
  await c.sleep(100)

  let levelDifference =
    c.xpToLevel(animateFromXp) - element.level
  if (!levelDifference) {
    let progressInCurrent = c.levelProgress(animateFromXp)
    let progressInFinal = c.levelProgress(element.xp)
    animateEase.value = 'ease-in-out'
    animateSpeedMs.value = Math.max(
      minSpeed,
      baseSpeed * (progressInFinal - progressInCurrent),
    )
    await nextTick()
    displayXp.value = element.xp
    // c.log(
    //   progressInCurrent,
    //   progressInFinal,
    //   animateFromXp,
    //   displayXp.value,
    //   displayLevel.value,
    // )
    await nextTick()
    await c.sleep(animateSpeedMs.value)

    animationComplete.value = true
    return
  } else {
    // * animate to end of current level
    let progressInCurrent = c.levelProgress(animateFromXp)
    animateSpeedMs.value = Math.max(
      minSpeed,
      baseSpeed - baseSpeed * progressInCurrent,
    )
    animateEase.value = 'ease-in'
    await nextTick()
    displayXp.value =
      c.levelToXp(displayLevel.value + 1) - 1
    await nextTick()
    await c.sleep(animateSpeedMs.value)

    // * jump to next level
    displayXp.value = c.levelToXp(displayLevel.value + 1)
    animateSpeedMs.value = 0
    hideNewProgress.value = true
    levelPoof.value?.classList.add('play')
    await nextTick()
    await c.sleep(100)

    // * animate to final
    const progressInFinal = c.levelProgress(element.xp)
    animateSpeedMs.value = Math.max(
      minSpeed,
      baseSpeed * progressInFinal,
    )
    animateEase.value = 'ease-out'
    await nextTick()
    await c.sleep(100)
    displayXp.value = element.xp
    await nextTick()
    await c.sleep(animateSpeedMs.value)

    // * reset
    animationComplete.value = true
  }
}
</script>

<style lang="scss" scoped>
.level {
  width: 22px;
  flex-grow: 0;
  flex-shrink: 0;
  font-size: 0.8rem;
  text-align: right;
  padding-right: 7px;
}
.xpbarholder {
  position: relative;
  --height: 0.8em;
  height: var(--height);
  width: 100%;
  border-radius: calc(var(--height) / 2);
  overflow: hidden;

  .bg {
    background: var(--highlight-l, rgba(0, 0, 0, 0.1));
    height: 100%;
    width: 100%;
    position: absolute;
  }
  .progress {
    background: var(--highlight, rgba(70, 70, 70, 1));
    height: 100%;
    position: absolute;
    transition: width var(--animateSpeed) var(--animateEase);
  }

  .newprogress {
    transform: translateX(-100%);
    background: rgba(white, 0.3);
    opacity: 1;
    height: 100%;
    position: absolute;
  }
}

.poof {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);

  &.play {
    background: var(--highlight, #444);
    width: 5em;
    height: 5em;
    border-radius: 50%;
    animation: poof 0.5s ease-out forwards;
  }
}

@keyframes poof {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}
</style>
