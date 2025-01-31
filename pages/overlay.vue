<template>
  <div class="_oaverlay">
    <div class="stratagems" :class="{ focusing: _focusindex != -1, cinematic: _cinematic_mode }">
      <div class="stratagem" v-for="(stratagem, index) in _stratagems" :key="stratagem.name"
        :class="{ focus: _focusindex == index }"
      >
        <img class="icon" :src="stratagem.icon" alt="" :class="{ canuse: !f_cooldown(stratagem) }">
        <img class="cooldown" :src="stratagem.icon" alt=""
          v-if="f_cooldown(stratagem) > 0"
          :style="{ 'clip-path': `polygon(0 ${f_cooldown(stratagem) * 100}%, 100% ${f_cooldown(stratagem) * 100}%, 100% 100%, 0% 100%)` }"
        >
        <div class="rotatekey" v-if="stratagem.rotatekey">{{ stratagem.rotatekey }}</div>
        <div class="hotkey" v-if="stratagem.hotkey">{{ stratagem.hotkey }}</div>
      </div>
      <div class="stratagem reinforce" v-if="_stratagems.length">
        <img class="icon canuse" :src="_reinforce.icon" alt="">
        <div class="hotkey" v-if="_reinforce.hotkey">{{ _reinforce.hotkey }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'overlay'
})


const _stratagems = ref([])
const _reinforce = {
  name: 'Reinforce',
  keys: ['up', 'down', 'right', 'left', 'up'],
  icon: '/stratagems/General Stratagems/Reinforce.svg',
  cooldown: 0,
  takedown: 0,
  hotkey: '`~'
}

ipcRenderer.on('stratagemsets', array => {
  _stratagems.value = array
})

ipcRenderer.on('stratagemFire', stratagem => {
  const target = _stratagems.value.find(s => s.name == stratagem.name)
  if (target) target.lastFire = stratagem.lastFire
  if (target.name.includes('Eagle')) {
    _stratagems.value.forEach(e => {
      if (e.name != 'Eagle Rearm' && e.name.includes('Eagle')) {
        e.cooldown = stratagem.cooldown
        e.lastFire = stratagem.lastFire
      }
    })
  }
})

const _focusindex = ref(-1)
ipcRenderer.on('stratagemFocus', index => {
  _focusindex.value = index
})
const _process = ref(false)
onMounted(async () => {
  _process.value = await ipcRenderer.invoke('loaded', 'overlay')
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

const _now = ref(Date.now())
setInterval(() => {
  _now.value = Date.now()
}, 100)
const f_cooldown = (stratagem) => {
  if (!stratagem.lastFire) return 0
  const cooldown = stratagem.cooldown + stratagem.takedown
  const remain = cooldown - (_now.value - stratagem.lastFire)
  if (remain <= 0) return 0
  return remain / cooldown
}

const _cinematic_mode = ref(false)
ipcRenderer.on('cinematic_mode', v => {
  _cinematic_mode.value = v
})
</script>

<style lang="scss" scoped>
._oaverlay {
  display: flex;
  justify-content: center;
  align-items: center;
  .stratagems {
    position: fixed;
    bottom: 10vh;
    display: flex;
    opacity: .5;
    .stratagem {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 1vh;
      background: rgba(0, 0, 0, .05);
      border: .3vh solid transparent;
      transform: scale(.8);
      .icon {
        height: 6vh;
        opacity: .3;
        &.canuse {
          opacity: 1;
        }
      }
      &.focus {
        border-color: rgb(255, 232, 0);
        background: rgba(0, 0, 0, .3);
        transform: scale(1);
      }
      .cooldown {
        opacity: 1;
        position: absolute;
      }
      .rotatekey {
        position: absolute;
        bottom: -1.5vh;
        font-size: 2vh;
        background: white;
        padding: 2px 4px;
        color: black;
      }
      .hotkey {
        position: absolute;
        top: -1.5vh;
        font-size: 2vh;
        background: white;
        padding: 2px 4px;
        color: black;
      }
      &.reinforce {
        margin-left: 3vh;
      }
    }
    &.focusing {
      opacity: 1;
    }
    &.cinematic {
      bottom: 1vh;
      .stratagem {
        .icon {
          height: 4vh;
        }
        .rotatekey {
          font-size: 1vh;
          bottom: -.7vh;
        }
        .hotkey {
          font-size: 1vh;
          top: -.7vh;
        }
      }
    }
  }
}
</style>
