<template>
  <div
    class="activity relative flexbetween"
    v-if="user"
    :key="appState.focusedDay.value + activity.id"
    :class="{ hover, slowHover }"
    @mouseover="hover = true"
    @mouseleave="hover = false"
    @mousedown="hover = false"
  >
    <div
      class="flexverticalcenter gapsmall nowrap fullwidth"
    >
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
      <div
        class="rightOfCheckboxZone relative flexverticalcenter gapsmall nowrap"
        @mouseleave="hover = false"
      >
        <transition name="fadeIn">
          <div class="inspiration" v-if="slowHover">
            <div v-if="activity.daysUntilStreakBreak >= 0">
              {{ activity.daysUntilStreakBreak }} day{{
                activity.daysUntilStreakBreak === 1
                  ? ''
                  : 's'
              }}
              left
            </div>
            <div
              v-if="
                activity.inspiration &&
                !activity.didClearOnDay(
                  appState.focusedDay.value,
                )
              "
            >
              {{ activity.inspiration }}
            </div>
          </div>
        </transition>

        <transition name="fadeIn">
          <div
            v-if="slowHover && activity.history.length"
            class="history"
          >
            <div
              class="historyEntry"
              v-for="entry in activity.history.filter(
                (h) => ![-1, 1].includes(h),
              )"
              :class="{
                completed: entry === 5,
                passedOver: entry === 1,
                failed: entry === 0,
              }"
            ></div>
          </div>
        </transition>

        <div
          class="relative"
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
          <span
            class="pointer"
            style="position: relative; top: 0.04em"
            @click="
              useRouter().push(`/activity/${activity.id}`)
            "
            >{{ activity.name }}</span
          >
        </div>

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
          v-if="hover || activity.streak"
        >
          <span
            class="small"
            v-if="
              c.dateToDateString(
                appState.focusedDay.value,
              ) === c.dateToDateString() &&
              activity.daysUntilStreakBreak < 0
            "
            >⚠️</span
          >

          <template v-if="activity.streak > 0">
            <span
              :style="{
                'font-size': '.6em',
                filter:
                  activity.didClearOnDay(
                    appState.focusedDay.value,
                  ) ||
                  !activity.willBreakStreakIfNotDoneToday
                    ? 'none'
                    : 'saturate(0)',
              }"
              >🔥</span
            ><span class="number">{{
              activity.streak
            }}</span>
          </template>

          <template
            v-if="hover && activity.totalTimesDone > 0"
          >
            <span
              class="number"
              :class="{ marlefttiny: activity.streak > 1 }"
            >
              ({{ activity.totalTimesDone }})
            </span>
          </template>
          <!-- <span v-else-if="activity.streak < 0">❗</span> -->
        </span>
      </div>

      <div
        v-if="
          c.dateToDateString(appState.focusedDay.value) ===
            c.dateToDateString() &&
          (activity.daysUntilStreakBreak >= 1 ||
            !activity.exact) &&
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

const hover = ref(false)
const hoverTimer = ref<NodeJS.Timeout | null>(null)
const slowHover = ref(false)

watch(
  hover,
  (h) => {
    if (h) {
      hoverTimer.value = setTimeout(() => {
        slowHover.value = true
        hoverTimer.value = setTimeout(() => {
          slowHover.value = false
        }, 10000)
      }, 500)
    } else {
      if (hoverTimer.value) clearTimeout(hoverTimer.value)
      slowHover.value = false
    }
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
.activity {
  margin-bottom: calc(
    (1 / var(--activityCount)) * 1em + 0.15em
  );
  cursor: default;
  transition: box-shadow 0.2s;
  position: relative;

  z-index: 1;
  &.hover {
    z-index: 3;
  }

  // &.slowHover {
  //   &:after {
  //     position: absolute;
  //     content: '';
  //     top: -0.2em;
  //     left: -0.2em;
  //     right: -0.2em;
  //     bottom: -0.2em;
  //     border-radius: var(--borderRadius);
  //     box-shadow: 0 0.2em 0.5em rgba(black, 0.5);
  //     z-index: 2;
  //     pointer-events: none;
  //   }
  // }

  // .veryDue {
  //   text-decoration: underline;
  // }
  // :not(.cleared).optional {
  //   color: var(--highlight);
  // }

  .checkbox {
    position: relative;
    cursor: pointer;
    z-index: 4;
  }
  .rightOfCheckboxZone {
    width: 100%;
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

  .inspiration {
    pointer-events: none;
    position: absolute;
    font-size: 0.85em;
    color: var(--textL);
    z-index: 10;
    width: calc(100% + 0.25em);
    line-height: 1.3;
    white-space: initial;
    top: calc(100% + 0.9rem);
    left: -0.25em;
    padding: 0.2em 0.5em;
    background: rgba(white, 0.95);
  }

  .history {
    pointer-events: none;
    position: absolute;
    font-size: 0.5rem;
    color: var(--textL);
    z-index: 10;
    width: calc(100% + 0.25em);
    overflow: hidden;
    white-space: initial;
    top: 100%;
    left: -0.25em;
    padding: 0.2rem 0.25rem;
    background: rgba(white, 0.95);
    display: flex;
    gap: 2px;

    .historyEntry {
      width: 0.25rem;
      height: 0.5rem;
      flex-shrink: 0;

      &.completed {
        background: var(--highlight);
      }
      &.passedOver {
        background: var(--textL2);
        width: 0.1rem;
      }
      &.failed {
        background: var(--text);
      }
    }
  }
}
</style>
