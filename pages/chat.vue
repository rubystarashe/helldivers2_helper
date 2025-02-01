<template>
  <div class="chat" :class="{ visible: _visible }">
    <div class="name">한글입력중</div>
    <input v-model="_chat" @input="$event => _chat = $event.target.value" ref="r_chat" spellcheck="false" @keydown.enter="f_sendChat" @keydown.esc="f_closeChat">
    <div class="cover"/>
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
  display: flex;
  &.visible {
    opacity: 1;
  }
  input {
    pointer-events: auto;
    ime-mode: auto;
    border: none;
    height: 100%;
    font-size: 20px;
    width: 100%;
    padding: 0;
    background: rgba(0, 0, 0, 1);
    color: white;
    font-weight: 300;
    padding-left: 10px;
    &:focus {
      outline: none;
    }
  }
  .name {
    background: white;
    font-size: 20px;
    height: 100%;
    padding: 2px 4px;
    color: black;
    flex-shrink: 0;
    display: flex;
    padding-top: 4px;
  }
  .cover {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    -webkit-user-select: none;
    -webkit-app-region: drag;
  }
}
</style>
