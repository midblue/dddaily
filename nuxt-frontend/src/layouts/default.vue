<template>
  <div>
    <InfoTooltip />
    <HeaderBar />
    <slot />
  </div>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import * as appState from '~/assets/nowThis/appState'

onMounted(async () => {
  updateWindowSizeVars()
  window.addEventListener('resize', updateWindowSizeVars)

  if (!appState.currentUser.value) await appState.loadUser()
})

function updateWindowSizeVars() {
  appState.winSize.value.width = window.innerWidth
  appState.winSize.value.height = window.innerHeight
}
</script>

<style lang="scss"></style>
