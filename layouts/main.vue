<template>
  <div class="layout" :class="{ visible: _visible }">
    <div class="titlebar">
      <div class="title">Accessible Rich Helldivers Application - v{{ $version }}</div>
      <ElectronWindowControl />
    </div>
    <div class="page">
      <slot/>
    </div>
  </div>
</template>

<script setup>
const _visible = ref(false)
ipcRenderer.on('visible', v => {
  if (!v) visible.value = v
  _visible.value = v
})

const { public: { version: $version } } = useRuntimeConfig()
</script>

<style lang="scss" scoped>
.layout {
  position: fixed;
  overflow: hidden;
  left: 0;
  right: 0;
  top: 0;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  background: rgba(0, 0, 0, .8);
  border-radius: 10px;
  opacity: 0;
  &.visible {
    opacity: 1;
  }
  .titlebar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    flex-shrink: 0;
    background: rgb(30, 31, 34);
    color: white;
    height: 40px;
    width: 100%;
    -webkit-user-select: none;
    -webkit-app-region: drag;
    z-index: 99999;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    overflow: hidden;
    .title {
      font-size: 14px;
      opacity: .7;
      margin-left: 10px;
    }
  }
  .page {
    position: fixed;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    color: rgb(3, 6, 22);
  }
}
</style>
