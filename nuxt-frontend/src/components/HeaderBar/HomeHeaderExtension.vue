<template>
  <div class="navextension padtop" v-if="user">
    <h1 class="marLR" v-if="user.nextDueActivity">
      Now,
      <span
        :style="{color: user.nextDueActivity!.hslString()}"
        >{{ user.nextDueActivity!.name }}</span
      >
    </h1>

    <template v-else-if="user.didClearOnDate()">
      <h1 class="marLR padtop padbotsmall">Full clear!</h1>
      <div class="fade marLR">See you tomorrow :)</div>
      <div
        class="fade marLR"
        v-if="user.bonusActivities.length"
      >
        In the meantime, why not
        <span class="bold">{{
          c
            .randomFromArray(user.bonusActivities)
            .toLowerCase()
        }}</span
        >?
      </div>
    </template>

    <template v-else-if="user.activities.length">
      <h1 class="marLR padtop padbotsmall">
        Done for
        {{
          user.nextActivityAt > new Date() ? 'today' : 'now'
        }}
      </h1>

      <div
        class="fade marLR"
        v-if="user.nextActivityAt > new Date()"
      >
        Next:
        <span
          class="bold"
          :style="{
            color: user.nextUpcomingActivity.hslString(),
          }"
          >{{ user.nextUpcomingActivity.name }}</span
        >
        at
        {{
          user.nextActivityAt.toLocaleTimeString('en-US', {
            hour: 'numeric',
          })
        }}
      </div>

      <div
        class="fade marLR"
        v-if="user.bonusActivities.length"
      >
        In the meantime, why not
        <span class="bold">{{
          c
            .randomFromArray(user.bonusActivities)
            .toLowerCase()
        }}</span
        >?
      </div>
    </template>

    <h1 class="marLR" v-else>Now, This</h1>

    <div
      v-if="user.nextDueActivity"
      class="martop relative"
    >
      <div class="bottomBg z1"></div>

      <div class="marLR relative z2">
        <nuxt-link
          class="button primary big martop flexrow gapsmall"
          :style="{
            '--highlight': user.nextDueActivity.hslString(),
          }"
          :to="`/activity/${user.nextDueActivity.id}`"
        >
          <div>Start</div>
          <div class="sub small">
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
      </div>
    </div>

    <div class="marLR">
      <DailyActivitiesBar class="martopsmall marbot" />
    </div>

    <div
      class="bottom relative padbotbig normal martopbig"
      :class="{ withBg: !user.nextDueActivity }"
    >
      <ClearDots :el="user" class="martop nopointer" />
      <div class="flexverticalcenter gap martopsmall">
        <ClearText :el="user" :fullClear="true" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import * as appState from '~/assets/nowThis/appState'

const user = appState.currentUser
</script>

<style scoped lang="scss">
.navextension {
  background: var(--text);
  color: var(--bg);
  overflow: hidden;

  .bottomBg {
    position: absolute;
    top: 35px;
    bottom: -300px;
    left: -100px;
    right: -100px;
    z-index: 1;
    background: rgba(255, 255, 255, 0.05);
  }

  .bottom {
    --highlight: rgba(255, 255, 255, 1);
    --highlight-l: rgba(255, 255, 255, 0.2);
    padding-left: var(--pagePadLr);

    &.withBg {
      padding-top: 1px;
      background: rgba(255, 255, 255, 0.05);
    }
  }
}
</style>
