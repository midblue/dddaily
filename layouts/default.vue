<template>
  <div
    class="pageheight flexcolumn"
    :style="{
      '--color1': `hsl(${c.colors[0][0]}, ${c.colors[0][1]}%, ${c.colors[0][2]}%)`,
      '--color2': `hsl(${c.colors[1][0]}, ${c.colors[1][1]}%, ${c.colors[1][2]}%)`,
      '--color3': `hsl(${c.colors[2][0]}, ${c.colors[2][1]}%, ${c.colors[2][2]}%)`,
      '--color4': `hsl(${c.colors[3][0]}, ${c.colors[3][1]}%, ${c.colors[3][2]}%)`,
      '--color5': `hsl(${c.colors[4][0]}, ${c.colors[4][1]}%, ${c.colors[4][2]}%)`,
      '--color6': `hsl(${c.colors[5][0]}, ${c.colors[5][1]}%, ${c.colors[5][2]}%)`,
      '--color7': `hsl(${c.colors[6][0]}, ${c.colors[6][1]}%, ${c.colors[6][2]}%)`,
      '--color8': `hsl(${c.colors[7][0]}, ${c.colors[7][1]}%, ${c.colors[7][2]}%)`,
      '--color9': `hsl(${c.colors[8][0]}, ${c.colors[8][1]}%, ${c.colors[8][2]}%)`,
      '--color10': `hsl(${c.colors[9][0]}, ${c.colors[9][1]}%, ${c.colors[9][2]}%)`,
      '--color11': `hsl(${c.colors[10][0]}, ${c.colors[10][1]}%, ${c.colors[10][2]}%)`,
      '--color12': `hsl(${c.colors[11][0]}, ${c.colors[11][1]}%, ${c.colors[11][2]}%)`,
      '--color13': `hsl(${c.colors[12][0]}, ${c.colors[12][1]}%, ${c.colors[12][2]}%)`,
      '--color14': `hsl(${c.colors[13][0]}, ${c.colors[13][1]}%, ${c.colors[13][2]}%)`,
      '--color15': `hsl(${c.colors[14][0]}, ${c.colors[14][1]}%, ${c.colors[14][2]}%)`,
    }"
  >
    <InfoTooltip />

    <div
      class="marauto"
      style="max-width: var(--contentMaxWidth)"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/common'
import * as appState from '~/assets/app/appState'

onMounted(async () => {
  updateWindowSizeVars()
  window.addEventListener('resize', updateWindowSizeVars)

  window.addEventListener('focus', onWindowFocus)

  window.addEventListener('click', onWindowInteract)
  // window.addEventListener('mousemove', onWindowInteract)
  window.addEventListener('keydown', onWindowInteract)
  window.addEventListener('blur', onWindowBlur)

  window.addEventListener('scroll', clearTooltip)
  window.addEventListener('mouseleave', clearTooltip)

  passiveReset()
  setInterval(passiveReset, 1000 * 60 * 5)

  if (!appState.currentUser.value) await appState.loadUser()
})

function updateWindowSizeVars() {
  appState.winSize.value.width = window.innerWidth
  appState.winSize.value.height = window.innerHeight
}

function onWindowFocus() {
  // c.log('window focus')
  appState.lastUserInteractionTimestampMs.value = Date.now()
  appState.windowIsFocused.value = true
  passiveReset()
}
async function passiveReset() {
  // c.log(
  //   'passive reset',
  //   appState.userIsProbablyActivelyUsingApp(),
  //   c.msToTimeString(
  //     Date.now() -
  //       appState.lastUserInteractionTimestampMs.value,
  //   ),
  // )
  if (!(await appState.networkCheck())) {
    useRouter().replace(`/offline`)
    return
  } else if (useRoute().path.includes('offline'))
    useRouter().replace(`/`)

  appState.currentUser.value?.passiveReset()
  if (!appState.getPassword())
    return useRouter().replace(`/login`)

  if (!appState.currentUser.value?.today?.energy)
    return useRouter().replace(`/`)
}
function onWindowInteract() {
  // c.log('interact')
  appState.lastUserInteractionTimestampMs.value = Date.now()
}
function onWindowBlur() {
  appState.windowIsFocused.value = false
  clearTooltip()
}
function clearTooltip() {
  appState.tooltip.value = null
}

// * key listeners

onMounted(() => {
  window.addEventListener('keydown', keyListener)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', keyListener)
})

function keyListener(e: KeyboardEvent) {
  if (
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(
      (e.target as HTMLElement)?.tagName,
    )
  )
    return
}
</script>

<style lang="scss" scoped></style>
