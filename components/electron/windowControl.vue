<template>
  <div class="window_control">
		<button class="ui-btn minimize" @click="f_minimize">
			<svg x="0px" y="0px" viewBox="0 0 10.2 1"><rect x="0" y="50%" width="10.2" height="1" /></svg>
		</button>
    <button v-if="_maximized" class="ui-btn restore" @click="f_unmaximize">
      <svg width="11" height="11" viewBox="0 0 11 11">
        <path d="m11 8.7978h-2.2021v2.2022h-8.7979v-8.7978h2.2021v-2.2022h8.7979zm-3.2979-5.5h-6.6012v6.6011h6.6012zm2.1968-2.1968h-6.6012v1.1011h5.5v5.5h1.1011z" stroke-width=".275" />
      </svg>
    </button>
    <button v-else class="ui-btn maximize" @click="f_maximize">
			<svg viewBox="0 0 10 10"><path d="M0,0v10h10V0H0z M9,9H1V1h8V9z" /></svg>
		</button>
    <button class="ui-btn close" @click="f_close">
			<svg viewBox="0 0 10 10"><polygon points="10.2,0.7 9.5,0 5.1,4.4 0.7,0 0,0.7 4.4,5.1 0,9.5 0.7,10.2 5.1,5.8 9.5,10.2 10.2,9.5 5.8,5.1" /></svg>
		</button>
  </div>
</template>

<script setup>
let _maximized = $ref(false)
ipcRenderer.on('maximized', v => _maximized = v)

const f_minimize = () => ipcRenderer.send('minimize', true)
const f_maximize = () => ipcRenderer.send('maximize', true)
const f_unmaximize = () => ipcRenderer.send('unmaximize', true)
const f_close = () => ipcRenderer.send('close', true)
</script>

<style lang="scss" scoped>
.window_control {
  -webkit-app-region: no-drag;
  height: 100%;
  .ui-btn {
    margin: 0;
    width: 48px;
    height: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    opacity: .7;
  }
  .ui-btn:hover {
    background: rgba(255,255,255,.1);
    opacity: 1;
  }
  .ui-btn.close:hover {
    background: #e81123;
  }
  .ui-btn svg path, 
  .ui-btn svg rect, 
  .ui-btn svg polygon {
    fill: #fff;
  }
  .ui-btn svg {
    width: 10px;
    height: 100%;
  }
}
</style>
