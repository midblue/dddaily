<template>
  <div
    class="slider"
    @mousedown.stop="clickSlider"
    ref="track"
  >
    <div class="sliderTrack" :class="{ line }">
      <svg
        v-if="!line"
        width="100%"
        height="100%"
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
      >
        <path
          class="bg"
          d="M 0 10 L 100 1 L 100 19 Z"
        ></path>

        <defs>
          <mask id="mask">
            <rect
              :x="
                range ? ((value - min) / spanSize) * 100 : 0
              "
              y="0"
              :width="
                range
                  ? ((upperValue - value) / spanSize) * 100
                  : ((value - min) / spanSize) * 100
              "
              height="20"
              fill="white"
            />
          </mask>
        </defs>
        <path
          class="active"
          mask="url(#mask)"
          d="M 0 10 L 100 1 L 100 19 Z"
        ></path>
      </svg>
    </div>
    <div
      class="sliderThumb"
      ref="thumb"
      @mousedown.stop="startDragLower"
      :style="{
        left:
          exponentialToPercent(
            (value - min) / (max - min),
          ) *
            100 +
          '%',
      }"
      :class="{ dragging: isDraggingLower }"
    >
      {{ c.r2(value) }}
    </div>
    <div
      class="sliderThumbHigh"
      v-if="range"
      @mousedown.stop="startDragUpper"
      :style="{
        left:
          exponentialToPercent(
            (upperValue - min) / (max - min),
          ) *
            100 +
          '%',
      }"
      :class="{ dragging: isDraggingUpper }"
    >
      {{ c.r2(upperValue) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/../../common'

const emit = defineEmits<{
  (e: 'update', to: number): void
  (e: 'updateUpper', to: number): void
}>()

const {
  min,
  max,
  step,
  range,
  initialValue,
  initialUpperValue,
  line,
  exponentialScale,
} = defineProps({
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 1,
  },
  step: {
    type: Number,
    default: 0.1,
  },
  range: {
    type: Boolean,
    default: false,
  },
  initialValue: {
    type: Number,
    default: 0,
  },
  initialUpperValue: {
    type: Number,
  },
  line: {
    type: Boolean,
    default: false,
  },
  exponentialScale: {
    type: Boolean,
    default: false,
  },
})

const spanSize = max - min

const value = ref(
  c.clamp(min, Math.round(initialValue / step) * step, max),
)
const upperValue = ref(
  c.clamp(
    min,
    Math.round((initialUpperValue || max) / step) * step,
    max,
  ),
)

const track = ref<HTMLElement | null>(null)
const thumb = ref<HTMLElement | null>(null)

const isDraggingLower = ref(false)
const isDraggingUpper = ref(false)

let exponentialScaleDegree = 2
function percentToExponentialScale(percent: number) {
  if (!exponentialScale) return percent
  //percent will be 0-1
  const scaledPercent = Math.pow(
    percent,
    exponentialScaleDegree,
  )
  return scaledPercent
}
function exponentialToPercent(percent: number) {
  if (!exponentialScale) return percent
  //percent will be 0-1
  const scaledPercent = Math.pow(
    percent,
    1 / exponentialScaleDegree,
  )
  return scaledPercent
}

function clickSlider(e: MouseEvent) {
  let percentAlongBar =
    (e.clientX - track.value!.offsetLeft) /
    track.value!.offsetWidth

  percentAlongBar =
    percentToExponentialScale(percentAlongBar)

  const newValue = min + (max - min) * percentAlongBar
  // round to multiple of step value
  const rounded = Math.round(newValue / step) * step
  if (range && rounded >= upperValue.value) {
    const prev = upperValue.value
    upperValue.value = rounded
    if (prev !== rounded) emit('updateUpper', rounded)
    startDragUpper(e)
  } else {
    const prev = value.value
    value.value = rounded
    if (prev !== rounded) emit('update', rounded)
    startDragLower(e)
  }
}

function startDragLower(e: MouseEvent) {
  isDraggingLower.value = true
  window.addEventListener('mousemove', mouseMove)
  window.addEventListener('mouseup', dragEnd)
  window.addEventListener('mouseleave', dragEnd)
}
function startDragUpper(e: MouseEvent) {
  isDraggingUpper.value = true
  window.addEventListener('mousemove', mouseMove)
  window.addEventListener('mouseup', dragEnd)
  window.addEventListener('mouseleave', dragEnd)
}

function mouseMove(e: MouseEvent) {
  const prevLower = value.value
  const prevUpper = upperValue.value

  let percentAlongBar =
    (e.clientX - track.value!.offsetLeft) /
    track.value!.offsetWidth

  percentAlongBar =
    percentToExponentialScale(percentAlongBar)

  if (isDraggingLower.value) {
    const newValue = c.clamp(
      min,
      min + (max - min) * percentAlongBar,
      max,
    )
    // round to multiple of step value
    value.value = Math.round(newValue / step) * step
    if (prevLower !== value.value)
      emit('update', value.value)

    if (value.value > upperValue.value) {
      upperValue.value = value.value
      if (prevUpper !== upperValue.value)
        emit('updateUpper', value.value)
    }
  }
  if (isDraggingUpper.value) {
    const newValue = c.clamp(
      min,
      min + (max - min) * percentAlongBar,
      max,
    )
    // round to multiple of step value
    upperValue.value = Math.round(newValue / step) * step
    if (prevUpper !== upperValue.value)
      emit('updateUpper', upperValue.value)

    if (value.value > upperValue.value) {
      value.value = upperValue.value
      if (prevLower !== value.value)
        emit('update', upperValue.value)
    }
  }
}

function dragEnd(e: MouseEvent) {
  isDraggingLower.value = false
  isDraggingUpper.value = false
  window.removeEventListener('mousemove', mouseMove)
  window.removeEventListener('mouseup', dragEnd)
  window.removeEventListener('mouseleave', dragEnd)
}
</script>

<style lang="scss" scoped>
.slider {
  position: relative;
  width: 100%;
  --thumbWidth: 30px;
  height: var(--thumbWidth);
  margin: 0 calc(var(--thumbWidth) / 2);

  .sliderTrack {
    position: absolute;
    z-index: 1;
    width: 100%;
    height: var(--thumbWidth);
    top: 50%;
    transform: translateY(-50%);
    &.line {
      height: 3px;
      background: lightgray;
    }

    svg {
      .bg {
        fill: lightgray;
      }
      .active {
        stroke: var(--text);
        stroke-width: 1px;
        fill: var(--highlight);
      }
    }
  }

  .sliderThumb,
  .sliderThumbHigh {
    position: absolute;
    z-index: 2;
    top: 50%;
    transform: translateY(-50%) translateX(-50%);
    left: 0;
    width: var(--thumbWidth);
    height: var(--thumbWidth);
    background: var(--text);
    color: white;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: grab;
    transform-origin: center;

    &.dragging {
      cursor: grabbing;
      transform: translateY(-50%) translateX(-50%)
        scale(1.2);
    }
  }
}
</style>
