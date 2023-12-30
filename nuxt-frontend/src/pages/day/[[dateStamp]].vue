<template>
  <div>
    <div
      v-if="user"
      :style="{
        '--activityCount':
          user.getActivitiesForDay(date).length,
      }"
    >
      <div
        class="windowheight flexbetween flexcolumn windowwidth"
      >
        <div
          class="flexgrow flexhorizcenter flexcolumn padleftbig padrightbig"
        >
          <h1 class="marbottiny">
            <div
              v-if="
                c.dateToDateString(date) !==
                c.dateToDateString()
              "
            >
              {{
                date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })
              }}
            </div>
            <div v-else-if="user.didClearOnDay(date)">
              {{ user.getStreak() }} day streak!
            </div>
            <div
              v-else-if="
                user
                  .getActivitiesForDay(date)
                  .find((a) => !a.didClearOnDay(date))
              "
            >
              Next,
              {{
                user
                  .getActivitiesForDay(date)
                  .find((a) => !a.didClearOnDay(date))?.name
              }}
            </div>
            <div v-else>
              Add an activity to get started!
            </div>
          </h1>

          <nuxt-link
            v-if="
              c.dateToDateString(date) !==
              c.dateToDateString()
            "
            :to="`/day/${c.dateToDateString()}`"
            ><button>Now</button></nuxt-link
          >

          <!-- <div class="small flex gap marbotsmall">
          <div>🔋 {{ (user.today?.energy || 0) * 10 }}</div>
          <div>
            😎 {{ (user.yesterday?.mood || 0) * 10 }}
          </div>
        </div> -->

          <HomeMainProgressBar />

          <div class="todaysActivitiesList martop">
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

          <!-- <div>
            <button
              class="small"
              @click="
                user.assignActivitiesForDay(
                  new Date(),
                  true,
                )
              "
            >
              reassign
            </button>
          </div> -->
          <div v-if="appState.focusedDayIsToday.value">
            <button
              class="small secondary fullwidth martopsmall"
              @click="user.addActivityOnDay(new Date())"
            >
              +
            </button>
          </div>
        </div>

        <HomeGraph
          class="marbot windowwidth"
          :toGraph="
            user.clears
              .slice(-30)
              .map((cl) => [
                cl.date,
                cl.mood,
                user?.didClearOnDay(cl.date) ? 1 : 0,
              ])
          "
          :max="1"
          :showLine="0.5"
          style="height: 100px"
        />
      </div>

      <hr />

      <div class="padleftsmall padtopbig">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import * as appState from '~/assets/app/appState'

const date = new Date(useRoute().params.dateStamp as string)
appState.focusedDay.value = date

const user = appState.currentUser

const orderedActivities = computed(() => {
  return user.value?.orderedActivities || []
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
      },
      true,
    )
  if (!newActivity) return

  useRouter().push(`/activity/${newActivity.id}`)
}

const activitiesThatMustBeDoneToday = computed(() => {
  if (c.dateToDateString(date) !== c.dateToDateString())
    return []
  return (
    user.value
      ?.getActivitiesForDay(date)
      .filter((a) => a.willBreakStreakIfNotDoneToday) || []
  )
})
const activitiesThatAreOptionalToday = computed(() => {
  return (
    user.value
      ?.getActivitiesForDay(date)
      .filter(
        (a) =>
          !activitiesThatMustBeDoneToday.value.includes(a),
      ) || []
  )
})
</script>

<style lang="scss" scoped>
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
