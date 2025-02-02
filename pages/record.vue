<template>
  <div class="_record">
    <div v-if="_deathcam.path">
      <video autoplay>
        <source :src="_deathcam.path" type="video/mp4">
      </video>
    </div>
    <div class="message" v-if="_record_message">{{ _record_message }}</div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'overlay'
})

const _process = ref(false)
onMounted(async () => {
  _process.value = await ipcRenderer.invoke('loaded', 'record')
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

let _record_message = ref('')
let _record_message_timer

let _deathcam = ref({})
ipcRenderer.on('deathcam', deathcam => {
  _deathcam.value = deathcam
  _record_message.value = '데스캠 화면'
  _record_message_timer = setTimeout(() => {
    _record_message.value = ''
  }, deathcam.length * 1000)
})

ipcRenderer.on('record_started', () => {
  _record_message.value = '다시보기를 저장하는 중'
  _record_message_timer = setTimeout(() => {
    _record_message.value = ''
  }, 3000)
})
ipcRenderer.on('record_saved', record => {
  _record_message.value = record ? `${record.length}초 다시보기 저장됨` : '다시보기 저장 실패'
  _record_message_timer = setTimeout(() => {
    _record_message.value = ''
  }, 3000)
})
</script>

<style lang="scss" scoped>
._record {
  position: fixed;
  width: 100%;
  height: 100%;
  video {
    width: 100%;
    height: auto;
  }
  .message {
    position: absolute;
    top: 5px;
    left: 5px;
    background: rgb(255, 232, 0);
    color: black;
    font-size: 28px;
    padding: 3px 6px;
    font-weight: 700;
  }
}
</style>
