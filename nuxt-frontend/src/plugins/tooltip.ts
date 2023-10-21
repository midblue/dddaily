import * as c from '~/../../common'
import { tooltip } from '~/assets/nowThis/appState'

export default defineNuxtPlugin((app) => {
  app.vueApp.directive(`tooltip`, {
    mounted(el, binding, vnode) {
      let tooltipData = binding.value

      el.setAttribute(`data-has-tooltip`, ``)

      const dataAsObject =
        typeof tooltipData === `string`
          ? { type: `html`, html: tooltipData }
          : tooltipData

      el.tooltipData = dataAsObject

      el.addEventListener(`mouseenter`, () => {
        window.addEventListener(`click`, clearTooltip)
        if (el.tooltipData) {
          tooltip.value = {
            ...el.tooltipData,
            elBCR: el.getBoundingClientRect(),
          }
        } else {
          tooltip.value = null
        }
      })

      const clearTooltip = () => {
        tooltip.value = null
        window.removeEventListener(`click`, clearTooltip)
      }
      el.addEventListener(`mouseleave`, clearTooltip)
    },

    updated(el, binding, vnode) {
      let tooltipData = binding.value
      const dataAsObject =
        typeof tooltipData === `string`
          ? { type: `html`, html: tooltipData }
          : tooltipData
      el.tooltipData = dataAsObject
    },
  })
})
