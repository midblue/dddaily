<template>
  <div class="graphHolder" v-if="toGraph.length > 1">
    <div
      class="graph flexcolumn flexstretch fullheight relative"
      ref="graphEl"
    >
      <div
        class="topLine smallcaps fade nopointer"
        v-if="showLine"
        :style="{
          top: `${
            17 +
            graphHeight -
            (showLine / maxValue) * graphHeight
          }px`,
        }"
      >
        <!-- <div class="label">
          {{ showLine * 10 }}
        </div> -->
        <div class="line"></div>
      </div>

      <svg
        :viewBox="`${-1 * leftRightBuffer} -20 ${
          graphWidth + leftRightBuffer * 2
        } ${graphHeight}`"
      >
        <defs>
          <linearGradient
            id="grad"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop
              offset="0%"
              :stop-color="`var(--highlight, rgba(0,0,0, 0.1))`"
            />
            <!-- <stop
              offset="50%"
              :stop-color="`var(--highlight, rgba(0,0,0, 0.1))`"
            /> -->
            <stop
              offset="100%"
              :stop-color="`var(--highlightTransparent, rgba(255,255,255,0))`"
            />
          </linearGradient>
        </defs>
        <path :d="d" fill="url(#grad)" />

        <template
          v-for="(
            [
              date,
              mood,
              didClear,
              didUseFreebie,
              didHaveMood,
              energyExpended,
            ],
            index
          ) in pointsWithRelevantXp"
        >
          <circle
            :cx="
              ((new Date(date).getTime() -
                startDate.getTime()) /
                span) *
              graphWidth
            "
            :cy="graphHeight - (mood! / maxValue) * graphHeight"
            :r="1.5 + 3 * (energyExpended || 0)"
            :fill="
              didClear
                ? didUseFreebie
                  ? 'var(--freebie)'
                  : 'var(--text)'
                : 'transparent'
            "
            :stroke="
              didClear ? 'transparent' : 'var(--text)'
            "
            stroke-width="1"
          />

          <rect
            class="dayLink"
            @click="toDate(date)"
            :x="
              ((new Date(date).getTime() -
                startDate.getTime()) /
                span) *
                graphWidth -
              graphWidth / toGraph.length / 2
            "
            :y="0"
            :width="graphWidth / toGraph.length"
            :height="graphHeight"
          />

          <text
            class="moodNumber"
            v-if="didHaveMood"
            :x="
              ((new Date(date).getTime() -
                startDate.getTime()) /
                span) *
              graphWidth
            "
            :y="
            graphHeight - (mood! / maxValue) * graphHeight - 8
            
          "
            text-anchor="middle"
            :dominant-baseline="'top'"
            font-size=".9em"
            fill="var(--text)"
          >
            {{ c.r2(mood! * 10, 0) }}
          </text>
        </template>
      </svg>

      <div
        class="dateAxis flexbetween small"
        :style="{
          padding: 0 + ' ' + leftRightBuffer * 0.8 + 'px',
        }"
      >
        <div class="dateAxisItem smallcaps fade markLeft">
          {{
            startDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year:
                endDate.getFullYear() ===
                startDate.getFullYear()
                  ? undefined
                  : 'numeric',
            })
          }}
        </div>
        <div class="freebies flex gaptiny">
          <div v-for="i in freebiesAvailable"></div>
        </div>
        <div class="dateAxisItem smallcaps fade markRight">
          Today
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/../../common'

const {
  toGraph,
  max,
  showLine,
  graphHeight,
  freebiesAvailable,
} = defineProps({
  toGraph: {
    type: Object as PropType<
      [
        DateString,
        number | undefined,
        number,
        boolean | undefined,
        number,
      ][]
    >,
    required: true,
  },
  max: {
    type: Number,
  },
  showLine: {
    type: Number,
  },
  graphHeight: {
    type: Number,
    default: 100,
  },
  freebiesAvailable: {
    type: Number,
    default: 0,
  },
})

// c.log(toGraph)

const graphWidth = ref(100)
const graphEl = ref<HTMLElement>()
const resizeObserver = new ResizeObserver(() => {
  graphWidth.value = graphEl.value?.offsetWidth || 100
})
onMounted(() => {
  graphWidth.value = graphEl.value?.offsetWidth || 100
  resizeObserver.observe(graphEl.value!)
})
onBeforeUnmount(() => {
  resizeObserver.unobserve(graphEl.value!)
})

const leftRightBuffer = computed(() => {
  return 30 //graphWidth.value * 0.1
})

const startDate = computed(() => {
  return new Date(toGraph[0][0])
})
const endDate = computed(() => {
  return new Date(toGraph[toGraph.length - 1][0])
})
const span = computed(() => {
  return endDate.value.getTime() - startDate.value.getTime()
})
const maxValue = computed(() => {
  if (max) return max
  return (
    Math.max(
      ...toGraph.map(([, mood]) => mood || -Infinity),
    ) + 0.1
  )
})

const maxEnergyExpended = computed(() => {
  return Math.max(
    ...toGraph.map(
      ([, , , , energyExpended]) => energyExpended,
    ),
  )
})
const pointsWithRelevantXp = computed(() => {
  let prevXp = 0
  return toGraph.map(
    ([
      date,
      mood,
      didClear,
      didUseFreebie,
      energyExpended,
    ]) => {
      if (mood !== undefined) prevXp = mood
      return [
        date,
        mood || prevXp,
        didClear,
        !!didUseFreebie,
        mood !== undefined,
        energyExpended / maxEnergyExpended.value,
      ]
    },
  ) as [
    DateString,
    number,
    number,
    boolean,
    boolean,
    number,
  ][]
})

const d = computed(() => {
  let d = ''
  for (
    let i = 0;
    i < pointsWithRelevantXp.value.length;
    i++
  ) {
    const [date, mood] = pointsWithRelevantXp.value[i]

    const dateObject = new Date(date)
    const x =
      ((dateObject.getTime() - startDate.value.getTime()) /
        span.value) *
      graphWidth.value
    const y = (mood / maxValue.value) * graphHeight

    if (i === 0) {
      d += `M ${-leftRightBuffer.value} ${y}`
    }

    d += ` L ${x} ${graphHeight - y}`

    if (i === pointsWithRelevantXp.value.length - 1) {
      d += ` L ${
        graphWidth.value + leftRightBuffer.value
      } ${graphHeight - y} L ${
        graphWidth.value + leftRightBuffer.value
      } ${graphHeight} L ${-leftRightBuffer.value} ${graphHeight} Z`
    }
  }

  return d
})

function toDate(date: DateString) {
  useRouter().push(`/day/${date}`)
}
</script>

<style lang="scss" scoped>
.topLine {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  gap: 0.5em;

  .label {
    transform: translate(0, -50%);
  }
  .line {
    width: 100%;
    border-top: 1px dashed var(--text);
    opacity: 0.5;
  }
}

.dayLink {
  z-index: 3;
  position: relative;
  cursor: pointer;
  fill: transparent;

  &:hover {
    fill: rgba(0, 0, 0, 0.1);
  }
}

.moodNumber {
  pointer-events: none;
  display: none;
}
.dayLink:hover + .moodNumber {
  display: block;
}

.dateAxis {
  position: absolute;
  top: 100%;
  width: 100%;

  --markerGap: 5px;
  mix-blend-mode: multiply;
}
.markRight {
  position: relative;
  right: var(--markerGap);

  &:after {
    content: '';
    display: block;
    position: absolute;
    top: -1em;
    right: calc(var(--markerGap) * -1);
    width: 2px;
    bottom: 2px;
    background: var(--textL);
  }
}
.markLeft {
  position: relative;
  left: var(--markerGap);

  &:after {
    content: '';
    display: block;
    position: absolute;
    top: -1em;
    left: calc(var(--markerGap) * -1);
    width: 2px;
    bottom: 2px;
    background: var(--textL);
  }
}

.freebies {
  div {
    width: 0.5em;
    height: 0.5em;
    border-radius: 50%;
    background: var(--freebie);
  }
}
</style>
