<template>
  <div
    class="moreButtons relative"
    @mouseleave="setOpen(false)"
    v-if="
      user &&
      user.activities.length >
        Object.keys(day?.clears || {}).length
    "
  >
    <div class="flexstretch martopsmall">
      <button
        class="small secondary fullwidth"
        @click="user.addActivityOnDay(date)"
      >
        More!
      </button>
      <div
        class="button small secondary marnone"
        @mouseenter="setOpen(true)"
        @click="setOpen(!open)"
      >
        ▼
      </div>
    </div>
    <div
      class="openPane flexcolumn marnone"
      v-if="open && user"
    >
      <div
        v-for="activity in user.activities
          .filter(
            (a) =>
              !(day?.clears || {}).hasOwnProperty(a.id),
          )
          .sort((a, b) => b.dueness - a.dueness)"
        :key="activity.id"
      >
        <button
          class="small secondary fullwidth textleft"
          @click="user.addActivityOnDay(date, activity)"
        >
          {{ activity.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/common'
import * as appState from '~/assets/app/appState'

const user = appState.currentUser
const date = appState.focusedDate.value
const day = user.value?.getDay(date)

const open = ref(false)

function setOpen(to?: boolean) {
  open.value = to ?? !open.value
}
</script>

<style lang="scss" scoped>
.moreButtons {
  z-index: 1;
}
.button,
button {
  height: 1.5em;

  &.textleft {
    background-color: transparent;
    margin: 0;
    padding: 0.2em 0.4em;
    text-align: left !important;
    justify-content: flex-start;
    align-items: flex-start;
  }
}
.openPane {
  z-index: 100;
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: var(--bgD);
  overflow-y: auto;
  max-height: calc(max(5.5em, 16vh));

  .button,
  button {
    &:hover {
      background-color: var(--bgD2);
    }
  }
}
</style>
