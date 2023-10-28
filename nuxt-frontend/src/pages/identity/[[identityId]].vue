<template>
  <PageTemplate
    v-if="identity"
    class="flexcolumn flexcenter flexbetween gapbig"
  >
    {{ identity.name }}
  </PageTemplate>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import * as appState from '~/assets/nowThis/appState'

const identityId = useRoute().params.identityId as string
const user = appState.currentUser
const identity = computed(() =>
  user.value?.getActivityById(identityId),
)
</script>

<style lang="scss" scoped></style>
