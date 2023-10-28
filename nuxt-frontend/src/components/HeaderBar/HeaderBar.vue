<template>
  <nav
    v-if="user"
    class="nooverflow"
    :style="{
      '--highlight':
        appState.currentActivity.value?.hslString() ||
        'transparent',
    }"
  >
    <div class="top flexbetween">
      <div>
        <nuxt-link
          to="/"
          class="headerButton clickableIconHolder"
          :class="{ hiddenButton: headerState === 'home' }"
          @click="c.log('click', useRoute().path)"
        >
          <img class="o3" src="/icons/home-white.svg" />
        </nuxt-link>
      </div>

      <div class="fullwidth padleftbig padrightbig">
        <div
          class="fullwidth relative"
          v-if="useRoute().path.includes('activity')"
        >
          <DailyActivitiesBar
            class="martopsmall padtopsmall fullwidth"
            v-if="appState.currentActivity.value"
          />
          <h3
            v-html="appState.currentActivity.value?.name"
            class="marnone marLR"
            :class="{
              martopsmall: appState.currentActivity.value,
            }"
          ></h3>
          <div
            class="upCaret"
            v-if="appState.currentActivity.value"
          ></div>
        </div>
      </div>

      <div>
        <nuxt-link
          class="headerButton clickableIconHolder"
          v-if="!['settings', 'home'].includes(headerState)"
          :to="
            useRoute().path.includes('activity/')
              ? useRoute()
                  .path.replace(
                    'activity/',
                    'activity/settings/',
                  )
                  .replace('complete/', '')
              : `/user`
          "
          ><img class="o3" src="/icons/settings-white.svg"
        /></nuxt-link>
        <div
          class="headerButton clickableIconHolder"
          v-else-if="!['home'].includes(headerState)"
          @click="useRouter().back()"
        >
          <img class="o3" src="/icons/back-white.svg" />
        </div>
        <div v-else class="headerButton hiddenButton"></div>
      </div>
    </div>
  </nav>
  <HeaderBarHomeHeaderExtension
    v-if="headerState === 'home'"
  />
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import * as appState from '~/assets/nowThis/appState'

const user = appState.currentUser

const headerState = computed(() => {
  if (
    useRoute().path.includes('/settings') ||
    useRoute().path.includes('/user')
  )
    return 'settings'

  if (
    useRoute().path.includes('/activity') &&
    user.value?.nextDueActivity
  )
    return 'study'

  if (useRoute().path.includes('/activity'))
    return 'activity'

  return 'home'
})
</script>

<style lang="scss" scoped>
nav {
  position: relative;
  background: var(--text);
  color: var(--bg);
  padding: 0;
  box-shadow: 0 3px 0 var(--highlight);
  min-height: 45px;

  .upCaret {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 0;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-bottom: 7px solid var(--highlight);
  }

  .top {
    width: 100%;
    // padding-left: var(--pagePadLr);
    // padding-right: var(--pagePadLr);
  }

  .headerButton {
    cursor: pointer;
    width: 45px;
    height: 45px;
    // padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    &.hiddenButton {
      opacity: 0;
      pointer-events: none;
    }
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 500;
    padding-bottom: 0.7em;
  }
}
</style>
