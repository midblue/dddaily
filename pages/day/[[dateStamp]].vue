<template>
  <div>
    <div
      v-if="user"
      :style="{
        '--activityCount':
          user.getActivitiesForDay(date).length,
      }"
    >
      <Confetti
        v-if="
          appState.focusedDayIsToday.value &&
          user.didMaxClearOnDay()
        "
        style="
          z-index: 1000;
          --c1: var(--freebie);
          --c2: var(--freebieD);
          --c3: var(--freebieL);
        "
      />
      <Confetti
        v-else-if="
          appState.focusedDayIsToday.value &&
          user.didClearOnDay()
        "
        style="
          z-index: 1000;
          --c1: var(--highlight);
          --c2: var(--highlightD);
          --c3: var(--highlightL);
        "
      />
      <div
        class="windowheightmin flexbetween flexcolumn windowwidth"
      >
        <div
          class="flexgrow flexhorizcenter flexcolumn padleftbig padrightbig padtop padbot"
        >
          <h1 class="marbottiny">
            <div
              v-if="
                c.dateToDateString(date) !==
                c.dateToDateString()
              "
              class="small textcenter"
            >
              {{ moment(date).format('dddd, MMM D, YYYY') }}
            </div>
            <div
              v-else-if="
                appState.focusedDayIsToday &&
                user.didMaxClearOnDay()
              "
            >
              Full Clear!
              <div class="sub" style="font-size: 1rem">
                {{ user.getStreak() }} day streak!
              </div>
              <div
                class="sub"
                style="font-size: 1rem"
                v-if="user.getDay(date)?.awardedFreebie"
              >
                <span class="freebie">Freebie</span> earned!
              </div>
            </div>
            <div v-else-if="user.didClearOnDay(date)">
              {{ user.getStreak() }} day streak!
            </div>
            <div v-else-if="nextActivity">
              Next,
              {{ nextActivity.name }}
              <div
                class="sub"
                style="font-size: 0.8rem"
                v-if="nextActivity.inspiration"
              >
                {{ nextActivity.inspiration }}
              </div>
            </div>
            <div v-else>
              Add an activity to get started!
            </div>
          </h1>

          <!-- {{ date }}
          <br />
          {{ c.dateToDateString(date) }}
          <br />
          {{ c.dateToDateString() }} -->
          <div
            v-if="
              c.dateToDateString(date) !==
              c.dateToDateString()
            "
            class="marbotsmall flexcolumn flexcenter"
          >
            <div class="nowrap">
              ⚠️ This is
              {{ c.daysBetween(date, moment()) }}
              day{{
                c.daysBetween(date, moment()) === 1
                  ? ''
                  : 's'
              }}
              ago.
            </div>

            <div class="flex gaptiny">
              <nuxt-link
                v-if="user.oldestEntry"
                class="small"
                :class="{
                  disabled: !user.getPreviousEntry(date),
                }"
                :to="`/day/${
                  user.getPreviousEntry(date)?.date
                }`"
                ><button class="secondary">
                  <
                </button></nuxt-link
              >

              <nuxt-link
                class="small"
                :to="`/day/${c.dateToDateString()}`"
                ><button>Today</button></nuxt-link
              >

              <nuxt-link
                class="small"
                v-if="user.getNextEntry(date)"
                :to="`/day/${
                  user.getNextEntry(date)?.date
                }`"
                ><button class="secondary">
                  >
                </button></nuxt-link
              >
            </div>
          </div>

          <!-- <div class="small flex gap marbotsmall">
          <div>🔋 {{ (user.today?.energy || 0) * 10 }}</div>
          <div>
            😎 {{ (user.yesterday?.mood || 0) * 10 }}
          </div>
          </div> -->

          <HomeMainProgressBar
            v-if="user.activities.length"
          />
          <div class="martopbig" v-else>
            <div
              class="button fullwidth"
              @click="newActivity"
            >
              <div
                class="flexcenter gapsmall padtopsmall padbotsmall"
              >
                <img
                  class="icon 07"
                  src="/icons/plus-white.svg"
                />
                New Activity
              </div>
            </div>
          </div>

          <div
            class="todaysActivitiesList martop relative z2"
          >
            <template
              v-if="appState.focusedDayIsToday.value"
            >
              <template
                v-if="activitiesThatMustBeDoneToday.length"
              >
                <div
                  class="divider"
                  v-if="
                    activitiesThatAreOptionalToday.length
                  "
                >
                  Definitely do all of these
                  <div class="line"></div>
                </div>
                <HomeDoableActivity
                  v-for="activity in activitiesThatMustBeDoneToday"
                  :key="'today' + activity.id"
                  class="flexverticalcenter gapsmall"
                  :activity="activity"
                />
              </template>
              <template
                v-if="activitiesThatAreOptionalToday.length"
              >
                <div
                  class="divider"
                  v-if="
                    activitiesThatMustBeDoneToday.length
                  "
                >
                  And some of these too
                  <div class="line"></div>
                </div>
                <HomeDoableActivity
                  v-for="activity in activitiesThatAreOptionalToday"
                  :key="'today' + activity.id"
                  class="flexverticalcenter gapsmall"
                  :activity="activity"
              /></template>
            </template>

            <template v-else>
              <HomeDoableActivity
                v-for="activity in user.getActivitiesForDay(
                  date,
                )"
                :key="'today' + activity.id"
                class="flexverticalcenter gapsmall"
                :activity="activity"
              />
            </template>
          </div>

          <MoreButtons />

          <!-- <div class="flexcenter martopsmall">
            <button
              class="small"
              @click="
                user.assignActivitiesForDay(
                  moment(),
                  true,
                )
              "
            >
              reassign
            </button>
          </div> -->
        </div>

        <HomeGraph
          v-if="user.activities.length"
          class="marbot windowwidth"
          :key="user.today?.effortExpended"
          :toGraph="
            user.clears
              .slice(-30)
              .map((cl) => [
                cl.date,
                cl.mood,
                user?.didClearOnDay(cl.date) ? 1 : 0,
                cl.usedFreebie,
                cl.effortExpended || 0,
              ])
          "
          :max="1"
          :showLine="0.5"
          :freebiesAvailable="user.freebiesAvailable"
          :streak="user.getStreak()"
          style="height: 100px"
        />
      </div>

      <hr style="opacity: 0.1" />

      <div class="padleftsmall padtopbig windowwidth">
        <div class="padleftsmall padbotsmall">
          <h1>Edit Activities</h1>
        </div>

        <div class="allActivitiesList">
          <div
            class="dragContainer"
            v-for="(activity, index) in orderedActivities"
            :key="activity.id"
            :class="{
              dragMode: tempShiftIndex !== -1,
              shiftUp:
                tempShiftIndex !== -1 &&
                index > tempShiftIndex &&
                index <= tempShiftIndex + tempShiftAmount,
              shiftDown:
                tempShiftIndex !== -1 &&
                index < tempShiftIndex &&
                index >= tempShiftIndex + tempShiftAmount,
            }"
          >
            <HomeDraggableActivity
              :activity="activity"
              @tempShift="tempShift"
              @resetTempShift="resetTempShift"
            />
          </div>
        </div>
      </div>

      <!-- {{ user.today }} -->

      <div class="marLR martopbig marbotbig padbot">
        <div class="button fullwidth" @click="newActivity">
          <div
            class="flexcenter gapsmall padtopsmall padbotsmall"
          >
            <img
              class="icon 07"
              src="/icons/plus-white.svg"
            />
            New Activity
          </div>
        </div>
      </div>

      <div
        class="padleft padright flexcolumn flexcenter marbotbig"
      >
        <div class="sub marbotsmall">
          Hi, {{ user.id }}!
        </div>
        <button
          class="secondary"
          @click="appState.logOut()"
        >
          Log Out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/common'
import * as appState from '~/assets/app/appState'
import moment from 'moment'
import type { Moment } from 'moment'

const dateStampFromUrl =
  (useRoute().params.dateStamp as string) ||
  c.dateToDateString()
// const userTimezoneOffset = 0 //moment().getTimezoneOffset()
// const userTimezoneOffsetInMs =
//   userTimezoneOffset * 60 * 1000
// const date = moment(
//   moment(dateStampFromUrl).valueOf() +
//     userTimezoneOffsetInMs,
// )
// c.log('date from route', useRoute().params.dateStamp)
const date = moment(dateStampFromUrl as DateString)

// appState.focusedDay.value = c.dateToDateString(date)

// c.log(
//   moment(),
//   c.dateToDateString(),
//   '2025-02-04',
//   moment('2025-02-04'),
//   '2025-02-04T00:00:00Z',
//   moment('2025-02-04T00:00:00Z'),
// )
// makeDateInLocalTimeZone('2025-02-04')

// function makeDateInLocalTimeZone(date: DateString) {
//   const userTimezoneOffset = moment().getTimezoneOffset()
//   const userTimezoneOffsetInMs =
//     userTimezoneOffset * 60 * 1000
//   const dateInUtc = moment(
//     moment(date).getTime() + userTimezoneOffsetInMs,
//   )

//   c.log({
//     date,
//     dateInUtc,
//     userTimezoneOffset,
//   })
//   c.log('hi')
// }

const user = appState.currentUser
// if (!user.value?.activities.length) {
//   c.log('no activities, adding one')
//   newActivity()
// }
if (appState.focusedDayIsToday.value) {
  // * if the user doesn't have enough activities to fill the day, try to add them now
  if (user.value?.today) {
    if (
      Object.keys(user.value.today.clears)
        .map((cl) => user.value?.getActivityById(cl))
        .reduce(
          (total, a) => total + (a?.effortRequired || 0),
          0,
        ) < (user.value.today.acceptableEffort || 0.01)
    )
      user.value.addActivityOnDay()

    if ((user.value.today.acceptableEffort || 0) === 0)
      user.value.assignActivitiesForDay(moment(), true)
  }
}

const orderedActivities = computed(() => {
  return user.value?.orderedActivities || []
})

const activitiesThatMustBeDoneToday = computed(() => {
  return (
    user.value
      ?.getActivitiesForDay(date)
      .filter((a) => a.daysUntilStreakBreak <= 0) || []
  )
})
const activitiesThatAreOptionalToday = computed(() => {
  return (
    user.value
      ?.getActivitiesForDay(date)
      .filter((a) => a.daysUntilStreakBreak > 0) || []
  ).sort(
    (a, b) =>
      a.daysUntilStreakBreak - b.daysUntilStreakBreak,
  )
})
const nextActivity = computed(() => {
  return (
    activitiesThatMustBeDoneToday.value.filter(
      (a) => !a.didClearOnDay(date),
    )[0] ||
    activitiesThatAreOptionalToday.value.filter(
      (a) => !a.didClearOnDay(date),
    )[0] ||
    null
  )
})

const tempShiftIndex = ref<number>(-1)
const tempShiftAmount = ref<number>(-1)
function tempShift(elementIndex: number, to: number) {
  tempShiftIndex.value = elementIndex
  tempShiftAmount.value = to
}
function resetTempShift() {
  tempShiftIndex.value = -1
  tempShiftAmount.value = -1
}

function newActivity() {
  const newActivity =
    user.value?.addActivityFromConstructorData(
      {
        name: 'New Activity',
        id: c.id('Activity'),
        type: 'Activity',
        effortRequired: 0.2,
      },
      true,
    )
  if (!newActivity) return

  useRouter().push(`/newActivity/${newActivity.id}`)
}
</script>

<style lang="scss" scoped>
.streakNumber {
  position: absolute;
  bottom: 0.3em;
  right: 0;
  left: 0;
  text-align: center;
  font-size: 0.8em;
  color: var(--textL);
}

.divider {
  display: flex;
  align-items: center;
  position: relative;
  font-size: 0.7em;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 0.2em;
  color: var(--textL);
  white-space: nowrap;
  gap: 0.5em;

  &:not(:first-of-type) {
    margin-top: 1.5em;
  }

  // .line {
  //   position: relative;
  //   width: 100%;
  //   border-top: 1px dashed var(--textL2);
  //   border-bottom: 1px dashed var(--textL2);
  //   top: -0.1em;
  // }
}

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
