<template>
  <div
    class="checkbox flexcenter"
    @click="click"
    :class="{
      checked,
    }"
  >
    <svg
      v-if="checked && !label"
      width="1em"
      height=".9em"
      viewBox="0 0 19 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.5 8.5L8 14L17 1"
        stroke="var(--text)"
        stroke-width="2.5"
      />
    </svg>
    <div v-if="label" class="label">
      {{ label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/common'

const emit = defineEmits<{
  (e: 'update', to: boolean): void
}>()

const { initialValue, label } = defineProps({
  initialValue: {
    type: Boolean,
    default: false,
  },
  label: {},
})

const checked = ref<boolean>(initialValue)

function click() {
  checked.value = !checked.value
  emit('update', checked.value)
}
</script>

<style lang="scss" scoped>
.checkbox {
  position: relative;
  cursor: pointer;
  min-width: 1.5em;
  height: 1.5em;
  box-shadow: inset 0 0 0 2px var(--text);
  background: var(--bgD);
  border-radius: var(--borderRadius);

  .label {
    display: flex;
    width: 100%;
    height: 100%;
    position: relative;
    font-size: 13px;
    font-weight: 300;
    padding: 0.15em 0.3em;
    align-items: flex-end;
    justify-content: flex-end;
    line-height: 1;
    opacity: 0.4;
  }
  .label {
    width: auto;
    height: auto;
    align-items: center;
    justify-content: center;
    top: 2px;
    left: 0;
    font-size: 16px;
  }

  &:not(.checked):hover {
    background: var(--bgD2);
  }

  &.checked {
    background: var(--highlight);

    .label {
      opacity: 1;
      font-weight: 600;
    }
  }
}
</style>
