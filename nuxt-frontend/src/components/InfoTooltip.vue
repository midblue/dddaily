<template>
  <div class="tooltipsection">
    <div
      class="tooltipHolder"
      ref="tooltipHolder"
      :style="tooltipStyle"
    >
      <div class="hovertooltip" :class="{ onLeft }">
        <div
          v-if="tooltip?.type === 'html'"
          v-html="tooltip.html || ''"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/../../common'
import * as appState from '~/assets/nowThis/appState'

const tooltip = appState.tooltip
const winSize = appState.winSize

const x = ref(0)
const y = ref(0)
const onLeft = ref(false)
const tooltipStyle = ref({} as any)

const tooltipHolder = ref<HTMLElement>()

watch(tooltip, (curr, prev) => {
  if (curr === prev || (curr?.id && curr?.id === prev?.id))
    return

  const ignoredTypes = ['part']
  if (ignoredTypes.includes(tooltip.value?.type)) {
    return
  }

  tooltipStyle.value = { opacity: 0 }

  recalcTooltipStyle()
})

watch(winSize, () => {
  recalcTooltipStyle()
})

async function recalcTooltipStyle() {
  await new Promise((resolve) =>
    requestAnimationFrame(resolve),
  )

  // c.log(tooltip.value?.elBCR)

  if (!tooltip.value || !tooltipHolder.value) {
    tooltipStyle.value = { opacity: 0 }
    return
  }

  try {
    const { width, height } =
      tooltipHolder.value.getBoundingClientRect()

    let hoverElementLeft =
      (tooltip.value.elBCR as DOMRect).left || x.value
    let hoverElementRight =
      (tooltip.value.elBCR as DOMRect).right || x.value
    let hoverElementTop =
      (tooltip.value.elBCR as DOMRect).top || y.value

    let showOnLeftSide = false
    const sidePad = 15
    let tooltipTop = Math.max(hoverElementTop, sidePad) //y.value - 5
    let transform = ''

    if (
      width + sidePad + hoverElementRight >=
      winSize.value.width
    ) {
      showOnLeftSide = true
    }

    if (
      tooltipTop + height >=
      winSize.value.height - sidePad
    ) {
      if (height + sidePad < winSize.value.height) {
        // c.log('adjusting tooltip to stick to bottom of window')
        tooltipTop = winSize.value.height - height - sidePad
      } else {
        // c.log('adjusting tooltip to stick to top of window')
        tooltipTop = sidePad
      }
      transform = ''
    }

    tooltipStyle.value = {
      top: tooltipTop + 'px',
      transform,
      opacity: 1,
    }
    onLeft.value = showOnLeftSide
    if (!showOnLeftSide) {
      // * right side
      let tooltipLeft = hoverElementRight + sidePad //x.value + sidePad
      tooltipStyle.value.right = 'unset'
      tooltipStyle.value.left = tooltipLeft + 'px'
    } else {
      // * left side
      let tooltipRight = hoverElementLeft - sidePad - width //x.value - sidePad / 2 - width
      if (tooltipRight < sidePad) {
        tooltipRight = sidePad
        // transform = 'translateY(30px)'
      }
      tooltipStyle.value.right = 'unset'
      tooltipStyle.value.left = tooltipRight + 'px'
    }
  } catch (e) {
    tooltipStyle.value = {
      opacity: 0,
    }
  }
}
</script>

<style lang="scss" scoped>
.tooltipsection {
  pointer-events: none;
  position: fixed;
  width: 100vw;
  height: 100vh;
  // width: 0;
  // height: 0;
  z-index: 1003;
}
.tooltipHolder {
  --panesectionpad-top: 0.6em;

  position: absolute;
  --tooltip-pad-lr: 0.5rem;
  --tooltip-pad-tb: 0.3rem;
  z-index: 1003;
  font-size: 0.9rem;
}

.origElBCRDebug {
  pointer-events: none;
  position: fixed;
  border: 1px solid red;
  z-index: 1002;
}
.hovertooltip {
  position: relative;
  max-width: 250px;
  font-weight: 400;
  background: #fff;
  color: var(--text);
  overflow: hidden;
  display: flex;
  box-shadow: 0 0 0 1px rgba(black, 0.1);

  hr {
    border: none;
    border-top: 1px solid var(--text);
    opacity: 0.2;
    margin: 0.5em -2em;
    width: 200%;
  }

  & > * {
    padding: var(--tooltip-pad-tb) var(--tooltip-pad-lr);
  }
}
</style>
