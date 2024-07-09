<template>
  <PageTemplate class="flexcolumn flexcenter gap">
    <button @click="appState.logOut">log out</button>
  </PageTemplate>
</template>

<script setup lang="ts">
import * as c from '~/common'
import * as appState from '~/assets/app/appState'
</script>

<style lang="scss"></style>
