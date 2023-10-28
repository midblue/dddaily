<template>
  <PageTemplate
    :key="'fullclear'"
    class="flexcolumn flexcenter gapbig textcenter transitionslow relative"
    :class="{
      invisible: animationStage !== 1,
    }"
  >
    <Confetti />
    <div class="big bold z3 relative">Done for today!</div>
  </PageTemplate>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import { User } from '~/assets/nowThis/DataStructure/User'
import * as appState from '~/assets/nowThis/appState'

const user = appState.currentUser

onMounted(() => {
  animateIn()

  const nextTime = 4000
  const path = useRoute().path
  setTimeout(async () => {
    if (useRoute().path !== path) return
    animationStage.value = 100
    await c.sleep(500)
    next()
  }, nextTime)

  window.addEventListener('keydown', keyListener)
})
onUnmounted(() => {
  window.removeEventListener('keydown', keyListener)
})

function next() {
  useRouter().push('/')
}

let animationMs = 500
let animationStage = ref(0)
function animateIn() {
  animationStage.value = 0
  setTimeout(() => {
    animationStage.value = 1
  }, 200)
}

function keyListener(e: KeyboardEvent) {
  e.preventDefault()
  next()
}
</script>

<style lang="scss" scoped></style>
