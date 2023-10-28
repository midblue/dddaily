<template>
  <div class="pageTemplate fullheight">
    <slot />
  </div>
</template>

<style lang="scss">
.pageTemplate {
  flex-grow: 1;
  padding: 1em var(--pagePadLr);

  .maincontent {
    flex-grow: 1;
  }
}
</style>
