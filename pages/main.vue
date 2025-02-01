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
      <div class="error" v-if="_steaminfo?.error">
        스팀의 게임 또는 계정 정보를 불러오는데 실패했습니다. 스팀 로그인을 확인하세요.
      </div>
      <div class="error" v-else-if="_steaminfo?.username &&!_steaminfo?.configInfo" @click="f_open_config_path"
        :style="{ cursor: 'pointer' }"
      >
        {{ _steaminfo?.username }} 계정의 {{ _steaminfo?.configPath }} 경로에 설정 파일이 없거나 문제가 있습니다.
      </div>
      <!-- <div class="username" v-else-if="_steaminfo?.username">{{ _steaminfo.username }}</div> -->
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
        </div>
        <div class="section">
          <h3 class="title">성능 설정</h3>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">스트라타젬 즉시 투척</div>
            </div>
            <input type="checkbox" class="checkbox" v-model="_stratagem_instant_fire"/>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">스트라타젬 투척 딜레이</div>
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
        </div>
        <div class="section">
          <h3 class="title">한글 채팅창 설정</h3>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">한글 채팅 입력 딜레이</div>
            </div>
            <input class="input" type="number" v-model="_chatinputdelay"/>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">한글 채팅 확장 창 좌측상단으로</div>
            </div>
            <div class="button" @click="f_chat_lefttop">초기화</div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">채팅 입력 시 자동 한글 확장 켜기</div>
            </div>
            <input type="checkbox" class="checkbox" v-model="_instant_chat"/>
          </div>
          <div class="option" v-if="!_instant_chat">
            <div class="meta">
              <div class="deco"/>
              <div class="name">한글 채팅 확장 단축키</div>
            </div>
            <div class="description">한/영</div>
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
            <div class="description" v-else>HUD 켜기/끄기<br/>키설정 필요</div>
          </div>
        </div>
        <div class="section">
          <h3 class="title">스트라타젬 마우스 입력 설정</h3>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">스트라타젬 마우스 입력 활성화</div>
            </div>
            <input type="checkbox" class="checkbox" v-model="_mousestratagem_enabled"/>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">입력 상태 활성화 단축키</div>
            </div>
            <div class="description">스페이스바</div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">스트라타젬 콘솔 조작 시 자동 활성화</div>
            </div>
            <input type="checkbox" class="checkbox" v-model="_mousestratagem_with_console"/>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">스트라타젬 마우스 입력 임계 감도</div>
            </div>
            <input class="input" type="number" v-model="_mousestratagem_threshold"/>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">스트라타젬 마우스 입력간 딜레이</div>
            </div>
            <input class="input" type="number" v-model="_mousestratagem_delay"/>
          </div>
        </div>
        <div class="section">
          <h3 class="title">기계화 설정 (실험실)</h3>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">기계화 전투 단축키</div>
            </div>
            <div class="description">마우스버튼1</div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">기계화 전투 사용 안함</div>
            </div>
            <input type="radio" class="radio" v-model="_autokey_type" :value="''">
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">폭발 주무기 연사</div>
            </div>
            <input type="radio" v-if="_keyBinds.weapon_swap" class="radio" v-model="_autokey_type" value="eruptor">
            <div class="description" v-else>장비 교체(짧은무기)<br/>키설정 필요</div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">레일건 자동 조작 보조</div>
            </div>
            <input type="radio" class="radio" v-model="_autokey_type" value="railgun">
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">아크 발사기 자동 조작 보조</div>
            </div>
            <input type="radio" class="radio" v-model="_autokey_type" value="arc">
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">대물소총 연발 사격</div>
            </div>
            <input type="radio" class="radio" v-model="_autokey_type" value="apw">
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">대물소총 반동 제어 감도</div>
            </div>
            <input class="input" type="number" v-model="_apw_start_rate"/>
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
    <div class="update" v-if="c_newversion" @click="f_update_install">최신 업데이트가 다운로드 되었습니다! 클릭하여 업데이트 하세요</div>
    <div class="update" v-else-if="_progress">신규 업데이트를 다운로드 받고 있습니다. {{ _progress?.percent?.toFixed(0) || 0 }}%</div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'main'
})

const _newversion = ref(false)
const _updating = ref(false)
const _progress = ref()
ipcRenderer.on('checking-for-update', v => {
  console.log(v)
})
ipcRenderer.on('update-not-available', v => {
  console.log(v)
})
ipcRenderer.on('update-error', v => {
  console.log(v)
})
ipcRenderer.on('update-available', v => {
  console.log('update-available')
  _updating.value = true
})
ipcRenderer.on('download-progress', v => {
  _progress.value = v
})
ipcRenderer.on('update-downloaded', v => {
  _updating.value = false
  _newversion.value = true
})
const c_newversion = computed(() => {
  return !_updating.value && _newversion.value
})
const f_update_install = () => {
  ipcRenderer.send('update_install')
}
setInterval(async () => {
  try {
    await ipcRenderer.invoke('check_update')
  } catch (e) {}
}, 1000 * 60 * 1)

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const _process = ref(false)
onMounted(async () => {
  await ipcRenderer.invoke('check_update')
  await sleep(1000)
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
  // localStorage.setItem('instantfire', _stratagem_instant_fire.value)
  ipcRenderer.send('instantfire', _stratagem_instant_fire.value)
})
ipcRenderer.on('instantfire', v => {
  _stratagem_instant_fire.value = v
})
const _stratagem_instant_fire_delay = ref(1000)
watch(_stratagem_instant_fire_delay, () => {
  // localStorage.setItem('instantfire_delay', _stratagem_instant_fire_delay.value)
  ipcRenderer.send('instantfire_delay', parseInt(_stratagem_instant_fire_delay.value || 0) || 0)
})
ipcRenderer.on('instantfire_delay', v => {
  _stratagem_instant_fire_delay.value = v
})
const _default_delay = ref(30)
watch(_default_delay, () => {
  // localStorage.setItem('inputDelay', _default_delay.value)
  ipcRenderer.send('inputDelay', parseInt(_default_delay.value || 0) || 0)
})
ipcRenderer.on('inputDelay', v => {
  _default_delay.value = v
})
const _chatinputdelay = ref(5)
watch(_chatinputdelay, () => {
  // localStorage.setItem('chatinputdelay', _chatinputdelay.value)
  ipcRenderer.send('chatinputdelay', parseInt(_chatinputdelay.value || 0) || 0)
})
ipcRenderer.on('chatinputdelay', v => {
  _chatinputdelay.value = v
})
const _rotate_delay = ref(300)
watch(_rotate_delay, () => {
  // localStorage.setItem('rotate_delay', _rotate_delay.value)
  ipcRenderer.send('rotate_delay', parseInt(_rotate_delay.value || 0) || 0)
})
ipcRenderer.on('rotate_delay', v => {
  _rotate_delay.value = v
})
const _instant_chat = ref(true)
watch(_instant_chat, () => {
  // localStorage.setItem('instant_chat', _instant_chat.value)
  ipcRenderer.send('instant_chat', _instant_chat.value)
})
ipcRenderer.on('instant_chat', v => {
  _instant_chat.value = v
})
const _cinematic_mode = ref(false)
watch(_cinematic_mode, () => {
  // localStorage.setItem('cinematic_mode', _cinematic_mode.value)
  ipcRenderer.send('cinematic_mode', _cinematic_mode.value)
})
ipcRenderer.on('cinematic_mode', v => {
  _cinematic_mode.value = v
})

const _autokey_enabled = ref(false)
watch(_autokey_enabled, () => {
  ipcRenderer.send('autokey_enabled', _autokey_enabled.value)
})
ipcRenderer.on('autokey_enabled', v => {
  _autokey_enabled.value = v
})
const _autokey_type = ref(null)
watch(_autokey_type, () => {
  ipcRenderer.send('autokey_type', _autokey_type.value)
})
ipcRenderer.on('autokey_type', v => {
  _autokey_type.value = v
})

const _auto_arc_delay = ref(1000)
watch(_auto_arc_delay, () => {
  ipcRenderer.send('auto_arc_delay', _auto_arc_delay.value)
})
ipcRenderer.on('auto_arc_delay', v => {
  _auto_arc_delay.value = v
})
const _auto_railgun_delay = ref(2900)
watch(_auto_railgun_delay, () => {
  ipcRenderer.send('auto_railgun_delay', _auto_railgun_delay.value)
})
ipcRenderer.on('auto_railgun_delay', v => {
  _auto_railgun_delay.value = v
})
const _auto_railgun_reload_delay = ref(1000)
watch(_auto_railgun_reload_delay, () => {
  ipcRenderer.send('auto_railgun_reload_delay', _auto_railgun_reload_delay.value)
})
ipcRenderer.on('auto_railgun_reload_delay', v => {
  _auto_railgun_reload_delay.value = v
})
const _auto_eruptor_delay = ref(400)
watch(_auto_eruptor_delay, () => {
  ipcRenderer.send('auto_eruptor_delay', _auto_eruptor_delay.value)
})
ipcRenderer.on('auto_eruptor_delay', v => {
  _auto_eruptor_delay.value = v
})
const _apw_start_rate = ref(240)
watch(_apw_start_rate, () => {
  ipcRenderer.send('apw_start_rate', _apw_start_rate.value)
})
ipcRenderer.on('apw_start_rate', v => {
  _apw_start_rate.value = v
})
const _mousestratagem_enabled = ref(false)
watch(_mousestratagem_enabled, () => {
  ipcRenderer.send('mousestratagem_enabled', _mousestratagem_enabled.value)
})
ipcRenderer.on('mousestratagem_enabled', v => {
  _mousestratagem_enabled.value = v
})
const _mousestratagem_with_console = ref(false)
watch(_mousestratagem_with_console, () => {
  ipcRenderer.send('mousestratagem_with_console', _mousestratagem_with_console.value)
})
ipcRenderer.on('mousestratagem_with_console', v => {
  _mousestratagem_with_console.value = v
})
const _mousestratagem_threshold = ref(50)
watch(_mousestratagem_threshold, () => {
  ipcRenderer.send('mousestratagem_threshold', _mousestratagem_threshold.value)
})
ipcRenderer.on('mousestratagem_threshold', v => {
  _mousestratagem_threshold.value = v
})
const _mousestratagem_delay = ref(100)
watch(_mousestratagem_delay, () => {
  ipcRenderer.send('mousestratagem_delay', _mousestratagem_delay.value)
})
ipcRenderer.on('mousestratagem_delay', v => {
  _mousestratagem_delay.value = v
})

ipcRenderer.on('initSettings', v => {
  _stratagem_instant_fire.value = v.instantfire
  _stratagem_instant_fire_delay.value = v.instantfire_delay
  _default_delay.value = v.inputDelay
  _chatinputdelay.value = v.chatinputdelay
  _rotate_delay.value = v.rotate_delay
  _instant_chat.value = v.instant_chat
  _cinematic_mode.value = v.cinematic_mode
  _autokey_enabled.value = v.autokey_enabled
  _autokey_type.value = v.autokey_type
  _auto_arc_delay.value = v.auto_arc_delay
  _auto_railgun_delay.value = v.auto_railgun_delay
  _auto_railgun_reload_delay.value = v.auto_railgun_reload_delay
  _auto_eruptor_delay.value = v.auto_eruptor_delay
  _apw_start_rate.value = v.apw_start_rate
  _mousestratagem_enabled.value = v.mousestratagem_enabled
  _mousestratagem_with_console.value = v.mousestratagem_with_console
  _mousestratagem_threshold.value = v.mousestratagem_threshold
  _mousestratagem_delay.value = v.mousestratagem_delay
})

// onMounted(() => {
//   _stratagem_instant_fire.value = localStorage.getItem('instantfire') ? localStorage.getItem('instantfire') == 'true' : true
//   _stratagem_instant_fire_delay.value = localStorage.getItem('instantfire_delay') ? parseInt(localStorage.getItem('instantfire_delay')) : 1000
//   _default_delay.value = localStorage.getItem('inputDelay') ? parseInt(localStorage.getItem('inputDelay')) : 20
//   _cinematic_mode.value = localStorage.getItem('cinematic_mode') ? localStorage.getItem('cinematic_mode') == 'true' : false
// })

const f_chat_lefttop = () => {
  ipcRenderer.send('chat_lefttop')
}

const _steaminfo = ref({})
ipcRenderer.on('steaminfo', v => {
  _steaminfo.value = v
})

const f_open_config_path = () => {
  ipcRenderer.send('open_config_path')
}
</script>

<style lang="scss" scoped>
._main {
  color: white;
  display: flex;
  height: 100%;
  padding: 20px;
  justify-content: space-around;
  box-sizing: border-box;
  img {
    -webkit-user-drag: none;
    user-drag: none;
  }
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
    position: relative;
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
    .error {
      word-break: break-all;
      width: 280px;
      box-sizing: border-box;
      padding: 10px;
      background: rgb(255, 232, 0);
      color: black;
      font-weight: 500;
      padding-right: 20px;
    }
    .username {
      opacity: .3;
      font-size: 13px;
      position: absolute;
      right: 20px;
      top: 0px;
    }
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
            margin-right: 10px;
            flex-shrink: 0;
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
            width: 100%;
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
          .radio {
            &[type="radio"] {
              appearance: none;
              width: 17px;
              height: 17px;
              border: 1.5px solid rgb(150, 150, 150);
              border-radius: 50%;
              cursor: pointer;
              position: relative;
            }
            
            &[type="radio"]:checked {
              border-color: rgb(255, 232, 0);
              background-color: transparent;
              
              &::after {
                content: '';
                position: absolute;
                width: 9px;
                height: 9px;
                border-radius: 50%;
                background-color: rgb(255, 232, 0);
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              }
            }
          }
          .button {
            background: rgb(255, 232, 0);
            padding: 3px 6px;
            font-size: 14px;
            color: black;
            font-weight: 500;
            cursor: pointer;
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
  .update{
    position: fixed;
    background: rgb(255, 232, 0);
    color: black;
    font-size: 28px;
    padding: 20px;
    left: 0;
    right: 0;
    top: 50px;
    cursor: pointer;
    font-weight: 400;
    text-align: center;
  }
}
</style>

