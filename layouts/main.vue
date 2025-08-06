<template>
  <div class="layout" :class="{ visible: _visible }">
    <div class="titlebar">
      <div class="title">Accessible Rich Helldivers Application - v{{ $version }}</div>
      <ElectronWindowControl />
    </div>
    <div class="page">
      <div class="navigation">
        <h1 class="title">
          {{ $route.query.type == 'modmanager' ? '모드 관리자' : '전투 보조 및 인터페이스 설정' }}
        </h1>
        <div class="navi">
          <NuxtLink to="/main" class="button" :class="{ selected: !$route.query.type }">접근성 설정</NuxtLink>
          <NuxtLink to="/main?type=modmanager" class="button" :class="{ selected: $route.query.type == 'modmanager' }">모드 관리</NuxtLink>
        </div>
      </div>
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
    display: flex;
    flex-direction: column;
    .navigation {
      padding-top: 30px;
      padding-bottom: 10px;
      height: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-right: 20px;
      .title {
        font-size: 28px;
        color: white;
        margin: 0;
        padding: 0;
        margin-top: -10px;
        margin-left: 30px;
      }
      .navi {
        display: flex;
        .button {
          -webkit-user-drag: none;
          user-drag: none;
          margin: 0 10px;
          width: 150px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 400;
          cursor: pointer;
          border: 3px solid transparent;
          border-color: rgb(255, 232, 0);
          color: rgb(255, 232, 0);
          background: rgba(255, 232, 0, .1);
          opacity: .7;
          &.selected {
            background: rgb(255, 232, 0);
            color: black;
            font-weight: 600;
            opacity: 1;
          }
          &.disabled {
            opacity: .5;
            pointer-events: none;
          }
        }
      }
    }
  }
}
</style>
