<template><div></div></template>

<script setup lang="ts">
import * as c from '~/common'
import * as appState from '~/assets/app/appState'

const user = appState.currentUser
if (user.value) {
  if (!user.value.today?.energy) {
    useRouter().push(`/moodCheck`)
  } else
    useRouter().push(
      `/day/${c.dateToDateString(
        appState.focusedDay.value,
      )}`,
    )
} else {
  useRouter().push(`/login`)
}

watch(user, () => {
  if (user.value && !user.value.today?.energy) {
    useRouter().push(`/moodCheck`)
  } else
    useRouter().push(
      `/day/${c.dateToDateString(
        appState.focusedDay.value,
      )}`,
    )
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
