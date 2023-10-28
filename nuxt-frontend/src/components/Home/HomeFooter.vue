<template>
  <div class="bottom padtopbig padbotbig flexcenter">
    <nuxt-link to="/user" class="clickableIconHolder"
      ><img src="/icons/settings-white.svg"
    /></nuxt-link>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import type { Activity } from '~/assets/nowThis/DataStructure/Activities/Activity'
import * as appState from '~/assets/nowThis/appState'

const user = appState.currentUser
</script>

<style lang="scss" scoped>
.bottom {
  background: var(--text);
  color: var(--bg);
}
</style>
