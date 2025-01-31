<template>
  <div class="_main">
    <div class="console">
      <div class="categories">
        <div class="category" v-for="(stratagems, category) in c_stratagems" :key="category">
          <h2 class="title">{{ _categories[category][_i18n] }}</h2>
          <div class="stratagems">
            <div class="stratagem" v-for="stratagem in stratagems" :key="stratagem.name"
              @click="f_isSelected(stratagem) ? f_removestratagem(stratagem) : f_addstratagem(stratagem)"
              :class="{ selected: f_isSelected(stratagem) }"
            >
              <img :src="stratagem.icon" alt="">
              <!-- <span v-if="stratagem.code">{{ stratagem.code }} </span>{{ stratagem.name }} {{ stratagem.index }} -->
            </div>
          </div>
        </div>
      </div>
      <div class="stratagemsets">
        <div class="stratagem" v-for="i in 6" :key="i"
          @click="f_removestratagem(_stratagemsets[i])"
          :class="{ selected: _stratagemsets[i] }"
        >
          <img :src="_stratagemsets[i]?.icon" alt="">
          <!-- <div class="name">
            <div v-if="_stratagemsets[i]?.code">{{ _stratagemsets[i]?.code }}</div>
            <div>{{ _stratagemsets[i]?.name }}</div>
          </div> -->
        </div>
        <div class="mission" v-if="_mission_stratagems.length > 0">
          <div class="stratagem" v-for="(stratagem, index) in _mission_stratagems" :key="stratagem.name"
            @click="f_removestratagem(_mission_stratagems[index])"
          >
            <img :src="stratagem.icon" alt="">
          </div>
        </div>
        <div class="default">
          <div class="stratagem" v-for="(stratagem, index) in _default_stratagems" :key="stratagem.name"
            @click="_default_stratagems_hidden[index] = _default_stratagems_hidden[index] ? false : true"
            :class="{ hidden: _default_stratagems_hidden[index] }"
          >
            <img :src="stratagem.icon" alt="">
          </div>
        </div>
      </div>
    </div>
    <div class="settings">
      <div class="options">
        <div class="section">
          <h3 class="title">단축키 설정</h3>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">증원 단축키</div>
            </div>
            <div class="description">`~</div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">→ 방향 로테이션 단축키</div>
            </div>
            <div class="description">T</div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">← 방향 로테이션 단축키</div>
            </div>
            <div class="description">H</div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">로테이션 취소 단축키</div>
            </div>
            <div class="description">우클릭</div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">한글 채팅 확장 단축키</div>
            </div>
            <div class="description">한/영</div>
          </div>
        </div>
        <div class="section">
          <h3 class="title">성능 설정</h3>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">스트라타젬 즉시 사용</div>
            </div>
            <input type="checkbox" class="checkbox" v-model="_stratagem_instant_fire"/>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">스트라타젬 즉시 사용 딜레이</div>
            </div>
            <input class="input" type="number" v-model="_stratagem_instant_fire_delay"/>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">스트라타젬 로테이션 선택 딜레이</div>
            </div>
            <input class="input" type="number" v-model="_rotate_delay"/>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">모든 동작 기본 딜레이</div>
            </div>
            <input class="input" type="number" v-model="_default_delay"/>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">한글 채팅 입력 딜레이</div>
            </div>
            <input class="input" type="number" v-model="_chatinputdelay"/>
          </div>
        </div>
        <div class="section">
          <h3 class="title">시네마틱 모드 설정</h3>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">시네마틱 모드 활성화</div>
            </div>
            <input type="checkbox" v-if="_keyBinds.cinematic_mode" class="checkbox" v-model="_cinematic_mode"/>
            <div class="description" v-else>HUD 켜기/끄기 키설정 필요</div>
          </div>
        </div>
        <div class="section">
          <h3 class="title">기계화 설정</h3>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">기계화 전투 단축키</div>
            </div>
            <div class="description">준비중</div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">레일건 초과충전 방지</div>
            </div>
            <div class="description">준비중</div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">이럽터 연사 모드</div>
            </div>
            <div class="description">준비중</div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">아크 발사기 연사 모드</div>
            </div>
            <div class="description">준비중</div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">자동 반동 제어</div>
            </div>
            <div class="description">준비중</div>
          </div>
        </div>
      </div>
      <div class="textbox">
        <div class="textboxtitle">
          <div class="textboxdeco"/>
          <div class="textboxname">선택적 복지 콘솔</div>
        </div>
        <div>당신은 장애를 갖고 있거나, 겁쟁이입니다. 하지만 이 새로운 기술을 사용하면 반드시 장애를 극복하고 두려움없는 헬다이버로 거듭날 수 있습니다.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'main'
})

const _process = ref(false)
onMounted(async () => {
  _process.value = await ipcRenderer.invoke('loaded', 'main')
  if (!_process.value?.isDev) {
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

const _keyBinds = ref({})
ipcRenderer.on('keyBinds', keyBinds => {
  _keyBinds.value = keyBinds
})


const _default_stratagems_hidden = ref([])
const _mission_stratagems = ref([
  {
    name: 'SEAF Artillery',
    keys: ['right', 'up', 'up', 'down'],
    icon: '/stratagems/General Stratagems/SEAF Artillery.svg',
    type: 'general',
    cooldown: 1000 * 5,
    takedown: 1000 * 10,
    index: 0
  }
])
const _default_stratagems = ref([
  {
    name: 'Eagle Rearm',
    keys: ['up', 'up', 'left', 'up', 'right'],
    icon: '/stratagems/Hangar/Eagle Rearm.svg',
    cooldown: 1000 * 120,
    takedown: 0,
    instant: true
  },
  {
    name: 'Resupply',
    keys: ['down', 'down', 'up', 'right'],
    icon: '/stratagems/General Stratagems/Resupply.svg',
    cooldown: 1000 * 160,
    takedown: 1000 * 15
  }
])

const _stratagems = STRATAGEMS
const c_stratagems = computed(() => {
  const stratagems = []
  for (const key in _stratagems) {
    stratagems.push(..._stratagems[key])
  }
  const res = {
    attack: [],
    supply: [],
    defense: [],
    general: []
  }
  for (const stratagem of stratagems) {
    const type = stratagem.type || 'undefined'
    if (!res[type]) continue
    res[type].push(stratagem)
  }
  for (const key in res) {
    res[key] = res[key].sort((a, b) => a.index - b.index)
  }
  return res
})

const _stratagemsets = ref({})
watch([_stratagemsets, _default_stratagems_hidden, _mission_stratagems], () => {
  const res = []
  for (const stratagem of Object.values(_stratagemsets.value)) {
    if (!stratagem) continue
    res.push({
      code: stratagem.code,
      name: stratagem.name,
      keys: [...stratagem.keys],
      icon: stratagem.icon,
      cooldown: stratagem.cooldown || 0,
      takedown: stratagem.takedown || 0
    })
  }
  for (const stratagem of _mission_stratagems.value) {
    res.push({
      ...stratagem,
      keys: [...stratagem.keys]
    })
  }
  for (const index in _default_stratagems.value) {
    if (_default_stratagems_hidden.value[index]) continue
    if (_default_stratagems.value[index].name == 'Eagle Rearm' && !res.find(e => e.name.includes('Eagle'))) continue
    res.push({
      ..._default_stratagems.value[index],
      keys: [..._default_stratagems.value[index].keys]
    })
  }
  if (res.length > 0) {
    res[0].rotatekey = 'T'
  }
  if (res.length > 1) {
    res[res.length - 1].rotatekey = 'H'
  }
  ipcRenderer.send('stratagemsets', res)
}, { deep: true })

const f_addstratagem = (stratagem) => {
  if (stratagem.type == 'general') {
    _mission_stratagems.value.push(stratagem)
    return
  }
  if (f_isSelected(stratagem)) return
  for (let i = 1; i <= 6; i++) {
    if (!_stratagemsets.value[i]) {
      _stratagemsets.value[i] = stratagem
      return
    }
  }
}
const f_removestratagem = (stratagem) => {
  const index = f_isSelected(stratagem)
  if (!index) return
  stratagem.type == 'general' ? _mission_stratagems.value.splice(index - 1, 1) : _stratagemsets.value[index] = null
}

const f_isSelected = stratagem => {
  if (!stratagem) return false
  if (stratagem.type == 'general') {
    const index = _mission_stratagems.value.findIndex(e => e.name == stratagem.name)
    if (index == -1) return false
    return index + 1
  }
  if (_stratagemsets.value[1]?.name == stratagem.name) return 1
  if (_stratagemsets.value[2]?.name == stratagem.name) return 2
  if (_stratagemsets.value[3]?.name == stratagem.name) return 3
  if (_stratagemsets.value[4]?.name == stratagem.name) return 4
  if (_stratagemsets.value[5]?.name == stratagem.name) return 5
  if (_stratagemsets.value[6]?.name == stratagem.name) return 6
  return false
}


const _i18n = ref('kor')
const _categories = {
  attack: {
    kor: '공격'
  },
  supply: {
    kor: '보급'
  },
  defense: {
    kor: '방어'
  },
  general: {
    kor: '임무'
  }
}


const _stratagem_instant_fire = ref(true)
watch(_stratagem_instant_fire, () => {
  localStorage.setItem('instantfire', _stratagem_instant_fire.value)
  ipcRenderer.send('instantfire', _stratagem_instant_fire.value)
})
const _stratagem_instant_fire_delay = ref(1000)
watch(_stratagem_instant_fire_delay, () => {
  localStorage.setItem('instantfire_delay', _stratagem_instant_fire_delay.value)
  ipcRenderer.send('instantfire_delay', parseInt(_stratagem_instant_fire_delay.value || 0) || 0)
})
const _default_delay = ref(30)
watch(_default_delay, () => {
  localStorage.setItem('inputDelay', _default_delay.value)
  ipcRenderer.send('inputDelay', parseInt(_default_delay.value || 0) || 0)
})
const _chatinputdelay = ref(5)
watch(_chatinputdelay, () => {
  localStorage.setItem('chatinputdelay', _chatinputdelay.value)
  ipcRenderer.send('chatinputdelay', parseInt(_chatinputdelay.value || 0) || 0)
})
const _rotate_delay = ref(300)
watch(_rotate_delay, () => {
  localStorage.setItem('rotate_delay', _rotate_delay.value)
  ipcRenderer.send('rotate_delay', parseInt(_rotate_delay.value || 0) || 0)
})
const _cinematic_mode = ref(false)
watch(_cinematic_mode, () => {
  localStorage.setItem('cinematic_mode', _cinematic_mode.value)
  ipcRenderer.send('cinematic_mode', _cinematic_mode.value)
})

onMounted(() => {
  _stratagem_instant_fire.value = localStorage.getItem('instantfire') ? localStorage.getItem('instantfire') == 'true' : true
  _stratagem_instant_fire_delay.value = localStorage.getItem('instantfire_delay') ? parseInt(localStorage.getItem('instantfire_delay')) : 1000
  _default_delay.value = localStorage.getItem('inputDelay') ? parseInt(localStorage.getItem('inputDelay')) : 20
  _cinematic_mode.value = localStorage.getItem('cinematic_mode') ? localStorage.getItem('cinematic_mode') == 'true' : false
})
</script>

<style lang="scss" scoped>
._main {
  color: white;
  display: flex;
  height: 100%;
  padding: 20px;
  justify-content: space-around;
  box-sizing: border-box;
  .console {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    .categories {
      display: flex;
      .category {
        margin: 10px;
        .title {
          margin: 0;
        }
        .stratagems {
          display: flex;
          flex-wrap: wrap;
          width: 280px;
          .stratagem {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 3px solid rgba(255, 255, 255, .3);
            margin: 5px;
            cursor: pointer;
            img {
              height: 54px;
            }
            &.selected {
              border-color: rgb(255, 232, 0);
              background: rgba(0, 0, 0, .8);
            }
          }
        }
      }
    }
    .stratagemsets {
      display: flex;
      .stratagem {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 3px solid rgba(255, 255, 255, .3);
        height: 85px;
        width: 85px;
        margin: 5px;
        img {
          height: 100%;
        }
        .name {
          position: absolute;
        }
        &.selected {
          border-color: rgb(255, 232, 0);
          background: rgba(0, 0, 0, .8);
        }
      }
      .mission {
        margin-left: 20px;
        display: flex;
      }
      .default {
        display: flex;
        margin-left: 20px;
        .hidden {
          opacity: .5;
        }
      }
    }
  }
  .settings {
    width: 100%;
    max-width: 900px;
    padding: 20px 0;
    box-sizing: border-box;
    margin-left: 20px;
    font-weight: 300;
    word-break: keep-all;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    .options {
      width: 100%;
      height: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: flex-start;
      overflow-y: auto;
      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      .section {
        margin: 20px;
        width: 280px;
        .title {
          width: 100%;
          margin: 0;
        }
        .option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 10px 0;
          padding: 3px;
          background: rgba(0, 0, 0, .5);
          .meta {
            display: flex;
            text-align: left;
            align-items: center;
            width: 100%;
            margin-right: 10px;
            .deco {
              width: 3px;
              height: 15px;
              background: rgb(255, 232, 0);
              margin-right: 5px;
            }
            .name {
              font-weight: 400;
              font-size: 14px;
              word-break: keep-all;
            }
          }
          .description {
            font-size: 14px;
            font-weight: 300;
            color: rgb(150, 150, 150);
            text-align: right;
            word-break: keep-all;
            min-width: 50px;
          }
          .input {
            width: 50px;
            text-align: right;
            background: transparent;
            border: none;
            outline: none;
            color: rgb(150, 150, 150);
            &:focus {
              border-bottom: 1px solid rgb(150, 150, 150);
            }
          }
          .checkbox {
            &[type="checkbox"] {
                appearance: none; /* 기본(네이티브) 모양을 제거 */
                box-sizing: border-box;
                background-clip: content-box;
                padding: 2px;
                width: 17px;
                height: 17px;
                border: 1.5px solid rgb(150, 150, 150);
                cursor: pointer;
            }
            &[type="checkbox"]:checked {
                border-color: rgb(255, 232, 0);
                background-color: rgb(255, 232, 0);
            }
          }
        }
      }
    }
    .textbox {
      margin-top: 20px;
      flex-shrink: 0;
      width: 330px;
      border: 3px solid rgba(255, 255, 255, .3);
      padding: 10px;
      padding-right: 20px;
      box-sizing: border-box;
      font-size: 13px;
      .textboxtitle {
        margin-top: -3px;
        display: flex;
        align-items: center;
        margin-bottom: 4px;
        .textboxdeco {
          width: 3px;
          height: 15px;
          background: rgb(255, 232, 0);
          margin-right: 5px;
        }
        .textboxname {
          font-weight: 400;
          font-size: 16px;
        }
      }
    }
  }
}
</style>

