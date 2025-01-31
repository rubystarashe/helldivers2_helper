<template>
  <div class="_layout" :class="{ visible: _visible }">
    <slot/>
  </div>
</template>

<script setup>
const _visible = ref(false)
ipcRenderer.on('visible', v => {
  _visible.value = v
})
</script>

<style lang="scss" scoped>
._layout {
  opacity: 0;
  &.visible {
    opacity: 1;
  }
}
</style>
