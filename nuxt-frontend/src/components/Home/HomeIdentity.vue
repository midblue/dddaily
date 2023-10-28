<template>
  <div class="identity padtop padbot" ref="mainBar">
    <div v-if="!demo && identity">
      <nuxt-link
        :to="`/identity/settings/${identity.id}`"
        @click="c.log(`/identity/settings/${identity.id}`)"
        class="block"
      >
        <div class="normal">{{ identity.name }}</div>
        <ClearDots
          class="nopointer martoptiny marbotsmall"
          :el="identity"
        />
        <div
          :style="{
            width: `${
              (identity.level / highestLevel) *
              Math.min(1, identity.level / 50 + 0.5) *
              100
            }%`,
          }"
          v-tooltip="
            `${c.r2(
              identity.totalXpInCurrentLevel *
                identity.levelProgress,
              0,
            )} / ${
              identity.totalXpInCurrentLevel
            } to level ${identity.level + 1}`
          "
        >
          <XPBar :element="identity" />
        </div>

        <!-- <div class="flex flexverticalcenter gap">
          <ClearText :el="identity" />
        </div> -->
      </nuxt-link>

      <div
        v-for="activity in relatedActivities.sort(
          (a, b) => b.xp - a.xp,
        )"
        :key="activity.id"
        class="activity"
        :style="{
          '--highlight': activity.hslString(),
          '--highlight-l': activity.hslString(0.3),
        }"
        v-tooltip="
          `<span style='color: ${activity.hslString()}''>${
            activity.name
          }</span>: ${c.r2(
            activity.totalXpInCurrentLevel *
              activity.levelProgress,
            0,
          )} / ${activity.totalXpInCurrentLevel} to level ${
            activity.level + 1
          }`
        "
      >
        <!-- <div class="normal">
          <span class="small highlight">
            {{ activity.name }}</span
          >
        </div> -->
        <div
          class="marbottiny padleftbig"
          :style="{
            width: `${
              (activity.level / highestLevel) *
              Math.min(1, activity.level / 50 + 0.5) *
              100
            }%`,
          }"
        >
          <XPBar
            style="font-size: 0.4em"
            :element="activity"
            :hideLevel="true"
          />
        </div>
      </div>
    </div>

    <div v-else="demo">demo</div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import type { Activity } from '~/assets/nowThis/DataStructure/Activities/Activity'
import type { Identity } from '~/assets/nowThis/DataStructure/Identity'
import * as appState from '~/assets/nowThis/appState'

const user = appState.currentUser
const { identity, demo } = defineProps({
  identity: {
    type: Object as PropType<Identity>,
  },
  demo: {
    type: Boolean,
    default: false,
  },
})
if (!identity) {
  useRouter().replace(`/`)
}

const relatedActivities: Ref<Activity[]> = computed(() => {
  if (!identity) return []
  return identity.relatedActivities
})

const mainBar = ref<HTMLElement | null>(null)

const highestLevel = computed(() => {
  if (!user.value) return 0
  return Math.max(
    ...user.value.activities.map((a) => a.level),
    ...user.value.identities.map((i) => i.level),
  )
})
</script>

<style lang="scss" scoped>
.identity {
  width: 100%;
  padding: 0 0 0 var(--pagePadLr);
  // line-height: 1.3;

  a {
    color: var(--text);
  }
}

.activity {
  line-height: 1.3;
}
</style>
