<template>
  <div class="chat" :class="{ visible: _visible }">
    <input v-model="_chat" @input="$event => _chat = $event.target.value" ref="r_chat" @keydown.enter="f_sendChat" @keydown.esc="f_closeChat">
    <div class="name">한글입력중</div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'overlay'
})

const _process = ref(false)
onMounted(async () => {
  _process.value = await ipcRenderer.invoke('loaded', 'chat')
  if (!_process.value.isDev) {
    onkeydown = e => {
      if(e.key === 'Tab') {
        e.preventDefault()
      }
      if(e.key === 'r' && e.ctrlKey) {
        e.preventDefault()
      }
      if (e.key === 'I' && e.ctrlKey) {
        e.preventDefault()
      }
    }
  }
})

const _visible = ref(false)
const _chat = ref('')
const r_chat = ref()
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
ipcRenderer.on('chatInput', async v => {
  try {
    if (v) {
      r_chat.value.focus()
      await ipcRenderer.invoke('chatInputInit')
      await sleep(20)
      if (_chat.value == 'i' || _chat.value == 'I') {
        await ipcRenderer.invoke('pressHangul')
      }
      r_chat.value.blur()
      await sleep(20)
      _chat.value = ''
      r_chat.value.value = ''
      r_chat.value.focus()
      _visible.value = true
    } else {
      _visible.value = false
    }
  } catch (e) {}
})

const f_sendChat = () => {
  ipcRenderer.send('chatInput', _chat.value)
  r_chat.value.blur()
  _chat.value = ''
  r_chat.value.value = ''
  _visible.value = false
}

const f_closeChat = () => {
  ipcRenderer.send('chatInput', null)
  r_chat.value.blur()
  _chat.value = ''
  r_chat.value.value = ''
  _visible.value = false
}
</script>

<style lang="scss" scoped>
.chat {
  position: fixed;
  opacity: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  &.visible {
    opacity: 1;
  }
  input {
    pointer-events: auto;
    position: fixed;
    bottom: .1vh;
    right: 0;
    ime-mode: auto;
    width: 90%;
    border: none;
    height: 5vh;
    font-size: 2.8vh;
    padding: 0;
    background: rgba(0, 0, 0, 1);
    color: white;
    font-weight: 300;
    &:focus {
      outline: none;
    }
  }
  .name {
    position: fixed;
    left: 0;
    bottom: 5vh;
    background: white;
    font-size: 2vh;
    background: white;
    padding: 2px 4px;
    color: black;
    opacity: .8;
  }
}
</style>
