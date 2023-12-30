<template>
  <div class="activity relative flexbetween" v-if="user">
    <div class="flexverticalcenter gapsmall nowrap">
      <Checkbox
        class="checkbox"
        :key="'chkbox' + activity.id + activity.streak"
        :initialValue="
          activity.didClearOnDay(appState.focusedDay.value)
        "
        @update="
          user.clearActivity(
            activity,
            c.dateToDateString(appState.focusedDay.value),
            $event ? 1 : 0,
          )
        "
      />
      <span
        :class="{
          cleared: activity.didClearOnDay(
            appState.focusedDay.value,
          ),
          veryDue: activity.dueness >= 1.5,
          optional: activity.dueness < 1.5,
        }"
      >
        <div
          class="clearedLine"
          v-if="
            activity.didClearOnDay(
              appState.focusedDay.value,
            )
          "
        ></div>
        <span style="position: relative; top: 0.04em">{{
          activity.name
        }}</span>
      </span>

      <Timer
        v-if="activity.timer && !activity.didClearOnDay()"
        :minutes="activity.timer"
      />

      <span
        class="streakNumber flexcenter"
        :class="{
          cleared: activity.didClearOnDay(
            appState.focusedDay.value,
          ),
        }"
        v-if="activity.totalTimesDone"
      >
        <!-- <span
          class="small"
          v-if="
            c.dateToDateString(
              appState.focusedDay.value,
            ) === c.dateToDateString() &&
            !activity.didClearOnDay() &&
            activity.willBreakStreakIfNotDoneToday
          "
          >⚠️</span
        > -->

        <template v-if="activity.totalTimesDone > 0">
          <span
            :style="{
              'font-size': '.6em',
              filter:
                activity.streak > 0 ? '' : 'saturate(0)',
            }"
            >🔥</span
          ><span class="number">{{
            activity.totalTimesDone
          }}</span></template
        >
        <!-- <span v-else-if="activity.streak < 0">❗</span> -->
      </span>
    </div>

    <div
      v-if="
        c.dateToDateString(appState.focusedDay.value) ===
          c.dateToDateString() &&
        !activity.exact &&
        user.today?.backupActivityIds?.length &&
        !activity.didClearOnDay(appState.focusedDay.value)
      "
      class="reloadSelf pointer"
      @click="
        user.swapActivityOnDay(
          appState.focusedDay.value,
          activity.id,
        )
      "
    >
      ↻
    </div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import * as appState from '~/assets/app/appState'
import type { Activity } from '~/assets/app/DataStructure/Activity'
const user = appState.currentUser

const { activity } = defineProps({
  activity: {
    type: Object as PropType<Activity>,
    required: true,
  },
})
</script>

<style lang="scss" scoped>
.activity {
  margin-bottom: calc(
    (1 / var(--activityCount)) * 1em + 0.15em
  );

  // .veryDue {
  //   text-decoration: underline;
  // }
  // :not(.cleared).optional {
  //   color: var(--highlight);
  // }

  .checkbox {
    position: relative;
    z-index: 4;
  }
  .cleared {
    position: relative;
    // text-decoration: line-through;
  }

  .clearedLine {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: -3px;
    right: -3px;
    height: 2px;
    z-index: 2;
    background: var(--text);
  }

  .streakNumber {
    display: inline-flex;
    align-items: center;
    font-size: 0.7em;
    height: 1rem;
    padding: 0.15em 0.3em 0 0.3em;
    // font-weight: bold;
    // background: var(--bgD2);

    line-height: 1;
    border-radius: var(--borderRadius);

    .number {
      color: var(--textL);
    }

    // &.cleared {
    //   // background-color: var(--textL);
    //   .number {
    //     color: var(--highlight);
    //     filter: brightness(0.8);
    //   }
    // }
  }

  .reloadSelf {
    height: 100%;
    padding: 0 0.5em;
    position: absolute;
    top: 0;
    right: -0.5em;
    cursor: pointer;

    &:hover {
      background: rgba(black, 0.1);
    }
  }
}
</style>
