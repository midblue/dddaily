<template><div></div></template>

<script setup lang="ts">
import * as c from '~/common'
import * as appState from '~/assets/app/appState'

const user = appState.currentUser
if (user.value) {
  if (!user.value.today?.energy) {
    c.l('redirecting to mood check on index load')
    useRouter().push(`/moodCheck`)
  } else {
    c.l('redirecting to day on index load')

    useRouter().push(`/day/${appState.focusedDay.value}`)
  }
} else if (!appState.loadingUser.value) {
  c.l('redirecting to login on index load')
  useRouter().push(`/login`)
} else {
  c.l('skipping index redirect because still loading user')
}

watch(user, () => {
  if (user.value && !user.value.today?.energy) {
    c.l('redirecting to mood check on user update')
    useRouter().push(`/moodCheck`)
  } else if (user.value) {
    c.l('redirecting to day on user update')
    useRouter().push(`/day/${appState.focusedDay.value}`)
  } else if (!appState.loadingUser.value) {
    c.l('redirecting to login on no-user update')
    useRouter().push(`/login`)
  }
})
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
</style>
