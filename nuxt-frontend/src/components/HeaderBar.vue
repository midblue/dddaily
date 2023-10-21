<template>
  <nav v-if="user" class="nooverflow">
    <div
      class="top flexbetween flexverticalcenter"
      v-if="
        useRoute()
          .path.split('/')
          .filter((e) => e).length > 0
      "
    >
      <button @click="useRouter().back()">Back</button>

      <div>title</div>
      <div>
        <nuxt-link
          :to="
            useRoute().path.includes('activity/')
              ? useRoute().path.replace(
                  'activity/',
                  'activity/settings/',
                )
              : `/user`
          "
          >⚙️</nuxt-link
        >
      </div>
    </div>
    <div v-else-if="user.nextActivity">
      <h1 class="martop">
        Now,
        <span
          :style="{
            color: user.nextActivity.hslString(),
          }"
          >{{ user.nextActivity.name }}</span
        >
      </h1>
    </div>
    <div v-if="user.nextActivity" class="martop">
      <DailyActivitiesBar />

      <div v-if="useRoute().path === '/'" class="relative">
        <div class="bottomBg"></div>

        <nuxt-link
          class="button big martopsmall"
          :style="{
            '--highlight': user.nextActivity.hslString(),
          }"
          :to="`/activity/${user.nextActivity.id}`"
        >
          <div>Start</div>
          <div class="sub small martoptiny">
            ~{{
              c.msToTimeString(
                user.estimatedTimeLeftTodayInMinutes *
                  60 *
                  1000,
                true,
              )
            }}
          </div>
        </nuxt-link>

        <div
          style="
            --highlight: rgba(255, 255, 255, 1);
            --highlight-l: rgba(255, 255, 255, 0.2);
          "
        >
          <ClearText :el="user" />
          <div class="">
            <ClearDots :el="user" />
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import type { ClearableWithXP } from '~/assets/nowThis/DataStructure/BaseClasses/ClearableWithXP'
import * as appState from '~/assets/nowThis/appState'

const user = appState.currentUser
</script>

<style lang="scss">
nav {
  background: var(--text);
  color: var(--bg);
  padding: 1em var(--pagePadLr);

  * {
    position: relative;
  }

  .bottomBg {
    position: absolute;
    top: 50px;
    bottom: -100px;
    left: -100px;
    right: -100px;
    z-index: 0;
    background: rgba(255, 255, 255, 0.07);
  }
}
</style>
