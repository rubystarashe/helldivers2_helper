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
            <div class="shortcut" @click="f_set_key('reinforce', '증원 단축키')">{{ f_get_key_string(_bindkeys.reinforce) }}</div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">→ 방향 로테이션 단축키</div>
            </div>
            <div class="shortcut" @click="f_set_key('rotatekey', '→ 방향 로테이션 단축키')">{{ f_get_key_string(_bindkeys.rotatekey) }}</div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">← 방향 로테이션 단축키</div>
            </div>
            <div class="shortcut" @click="f_set_key('rotatekey_reverse', '← 방향 로테이션 단축키')">{{ f_get_key_string(_bindkeys.rotatekey_reverse) }}</div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">로테이션 취소 단축키</div>
            </div>
            <div class="shortcut" @click="f_set_key('rotate_cancel', '로테이션 취소 단축키')">{{ f_get_key_string(_bindkeys.rotate_cancel) }}</div>
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
          <!-- <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">한글 채팅 확장 창 좌측상단으로</div>
            </div>
            <div class="button" @click="f_chat_lefttop">초기화</div>
          </div> -->
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
            <div class="shortcut" @click="f_set_key('HANGUL', '한글 채팅 확장 단축키')">{{ f_get_key_string(_bindkeys.HANGUL) }}</div>
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
            <div class="shortcut" @click="f_set_key('mousestratagem', '스트라타젬 마우스 입력 상태 활성화 단축키')">{{ f_get_key_string(_bindkeys.mousestratagem) }}</div>
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
          <h3 class="title">기계화 설정</h3>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">재장전 속도 증가 갑옷 착용 여부</div>
            </div>
            <input type="checkbox" class="checkbox" v-model="_autokey_with_goodarmor"/>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">기계화 전투 1번 단축키</div>
            </div>
            <div class="shortcut" @click="f_set_key('autokey', '기계화 전투 단축키')">{{ f_get_key_string(_bindkeys.autokey) }}</div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">기계화 전투 1번</div>
            </div>
            <select class="select" v-model="_autokey_type">
              <option class="option" v-for="item in _autokey_type_map" :value="item.value">{{ item.name }}</option>
            </select>
          </div>
          <div class="option" v-if="(_autokey_type == 'eruptor') && !_keyBinds.weapon_swap">
            <div class="meta" :style="{ width: '100%', 'text-align': 'right' }">
              <div class="deco"/>
              <div class="description" :style="{ width: '100%', 'text-align': 'right' }">장비 교체(짧은무기) 키설정 필요</div>
            </div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">기계화 전투 2번 단축키</div>
            </div>
            <div class="shortcut" @click="f_set_key('autokey_sub', '기계화 전투 단축키')">{{ f_get_key_string(_bindkeys.autokey_sub) }}</div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">기계화 전투 2번</div>
            </div>
            <select class="select" v-model="_autokey_type_sub">
              <option class="option" v-for="item in _autokey_type_map" :value="item.value">{{ item.name }}</option>
            </select>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">기계화 전투 3번 단축키</div>
            </div>
            <div class="shortcut" @click="f_set_key('autokey_sub2', '기계화 전투 단축키')">{{ f_get_key_string(_bindkeys.autokey_sub2) }}</div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">기계화 전투 3번</div>
            </div>
            <select class="select" v-model="_autokey_type_sub2">
              <option class="option" v-for="item in _autokey_type_map" :value="item.value">{{ item.name }}</option>
            </select>
          </div>
          <div class="option" v-if="(_autokey_type_sub == 'eruptor') && !_keyBinds.weapon_swap">
            <div class="meta" :style="{ width: '100%', 'text-align': 'right' }">
              <div class="deco"/>
              <div class="description" :style="{ width: '100%', 'text-align': 'right' }">장비 교체(짧은무기) 키설정 필요</div>
            </div>
          </div>
          <div class="option" v-if="_autokey_type == 'heavy' || _autokey_type_sub == 'heavy' || _autokey_type_sub2 == 'heavy'">
            <div class="meta">
              <div class="deco"/>
              <div class="name">중기관총 반동 제어 감도</div>
            </div>
            <input class="input" type="number" v-model="_heavy_start_rate"/>
          </div>
          <div class="option" v-if="_autokey_type == 'heavy' || _autokey_type_sub == 'heavy' || _autokey_type_sub2 == 'heavy'">
            <div class="meta">
              <div class="deco"/>
              <div class="name">중기관총 사용 RPM</div>
            </div>
            <input class="input" type="number" v-model="_heavy_rpm"/>
          </div>
          <div class="option" v-if="_autokey_type == 'purifier' || _autokey_type_sub == 'purifier' || _autokey_type_sub2 == 'purifier'">
            <div class="meta">
              <div class="deco"/>
              <div class="name">퓨리파이어 반동 제어 감도</div>
            </div>
            <input class="input" type="number" v-model="_purifier_move_rate"/>
          </div>
          <div class="option" v-if="_autokey_type == 'apw' || _autokey_type_sub == 'apw' || _autokey_type_sub2 == 'apw'">
            <div class="meta">
              <div class="deco"/>
              <div class="name">대물소총 반동 제어 감도</div>
            </div>
            <input class="input" type="number" v-model="_apw_start_rate"/>
          </div>
        </div>
        <div class="section">
          <h3 class="title">플레이 자동 녹화</h3>
          <!-- <div class="option" v-if="_game_display.rotate">
            <div class="meta" :style="{ width: '100%', 'text-align': 'right' }">
              <div class="deco"/>
              <div class="description" :style="{ width: '100%', 'text-align': 'right' }">모니터가 회전 상태여서 녹화할 수 없습니다</div>
            </div>
          </div> -->
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">플레이 자동 녹화 활성화</div>
            </div>
            <input type="checkbox" class="checkbox" v-model="_autorecord"/>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">동영상 저장 위치 열기</div>
            </div>
            <div class="button" @click="f_open_video_folder">폴더 열기</div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">저장된 동영상 전부 삭제</div>
            </div>
            <div class="button" :class="{ disabled: !_video_path_size }" @click="f_clear_video_folder">{{ _video_path_size ? f_format_size(_video_path_size) : '동영상 없음' }}</div>
          </div>
          <div class="option" v-if="_displaylength > 1">
            <div class="meta">
              <div class="deco"/>
              <div class="name">녹화 대상 모니터 번호</div>
            </div>
            <select class="select" v-model="_output_idx">
              <option class="option" v-for="item in _displaylength" :value="item - 1">{{ item - 1 }}</option>
            </select>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">자동 녹화 단축키</div>
            </div>
            <div class="shortcut" @click="f_set_key('record', '자동 녹화 단축키')">{{ f_get_key_string(_bindkeys.record) }}</div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">최대 자동 녹화 시간</div>
            </div>
            <div><input class="input" type="number" v-model="_record_duration" :min="_deathcam_seconds + _deathcam_delay + 1"/><span class="unit">초</span></div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">자동 녹화 초당 프레임</div>
            </div>
            <input class="input" type="number" v-model="_record_framerate"/>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">자동 녹화 품질</div>
            </div>
            <select class="select" v-model="_record_quality">
              <option class="option" v-for="item in _record_quality_map" :value="item.value">{{ item.name }}</option>
            </select>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">자동 데스캠 저장 활성화</div>
            </div>
            <input type="checkbox" class="checkbox" v-model="_deathcam_enabled"/>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">데스캠 녹화 시간</div>
            </div>
            <div><input class="input" type="number" v-model="_deathcam_seconds"/><span class="unit">초</span></div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">데스캠 녹화 딜레이</div>
            </div>
            <div><input class="input" type="number" v-model="_deathcam_delay"/><span class="unit">초</span></div>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">데스캠 미리보기 활성화</div>
            </div>
            <input type="checkbox" class="checkbox" v-model="_deathcam_preview"/>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">데스캠 미리보기 크기 배율</div>
            </div>
            <input type="number" class="input" v-model="_deathcam_size" :min="20" :max="200"/>
          </div>
          <div class="option">
            <div class="meta">
              <div class="deco"/>
              <div class="name">데스캠 webp 변환 활성화</div>
            </div>
            <input type="checkbox" class="checkbox" v-model="_deathcam_webp"/>
          </div>
          <div class="option">
            <div class="meta" :style="{ width: '100%', 'text-align': 'right' }">
              <div class="deco"/>
              <div class="description" :style="{ width: '100%', 'text-align': 'right' }">webp 변환 시 20MB 이하의 용량이 됩니다</div>
            </div>
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
    <div v-if="_key_modal" class="key_modal" @click.self="f_cancel_key">
      <div class="inner">
        <div class="title"><div class="deco"/>단축키 변경</div>
        <div class="name">{{ _key_modal }}</div>
        <div class="key">{{ f_get_key_string(_key_watching_key) }}</div>
        <div class="buttons">
          <div class="button cancel" @click="f_cancel_key">취소</div>
          <div class="button save" @click="f_save_key">저장</div>
        </div>
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
  // 마우스 버튼 클릭 시 기본 동작 차단
  window.onmousedown = e => {
    if (e.button === 3 || e.button === 4) { // 3: 뒤로가기 버튼, 4: 앞으로가기 버튼
      e.preventDefault()
    }
  }
  window.onkeydown = e => {
    if (e.key === ' ') { // 스페이스 키 막기
      e.preventDefault()
    }
    if (e.key?.startsWith('F') && e.key.length <= 3) { // F1 ~ F12 키 막기
      e.preventDefault()
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
const _autokey_with_goodarmor = ref(false)
watch(_autokey_with_goodarmor, () => {
  ipcRenderer.send('autokey_with_goodarmor', _autokey_with_goodarmor.value)
})
ipcRenderer.on('autokey_with_goodarmor', v => {
  _autokey_with_goodarmor.value = v
})
const _autokey_type_map = [
  { name: '기계화 전투 미사용', value: '' },
  { name: '이럽터 연사 보조', value: 'eruptor' },
  { name: '폭발 석궁 연사 보조', value: 'crossbow' },
  { name: '퓨리파이어 연사 제어 보조', value: 'purifier' },
  { name: '퓨리파이어 충전사격 보조', value: 'purifier_charge' },
  { name: '레일건 자동 조작 보조', value: 'railgun' },
  { name: '아크 발사기 자동 조작 보조', value: 'arc' },
  { name: '중기관총 반동 제어 보조', value: 'heavy' },
  { name: '대물소총 연발 사격', value: 'apw' }
]
const _autokey_type = ref('')
watch(_autokey_type, () => {
  ipcRenderer.send('autokey_type', _autokey_type.value)
})
ipcRenderer.on('autokey_type', v => {
  _autokey_type.value = v
})
const _autokey_type_sub = ref('')
watch(_autokey_type_sub, () => {
  ipcRenderer.send('autokey_type_sub', _autokey_type_sub.value)
})
ipcRenderer.on('autokey_type_sub', v => {
  _autokey_type_sub.value = v
})
const _autokey_type_sub2 = ref('')
watch(_autokey_type_sub2, () => {
  ipcRenderer.send('autokey_type_sub2', _autokey_type_sub2.value)
})
ipcRenderer.on('autokey_type_sub2', v => {
  _autokey_type_sub2.value = v
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
const _auto_eruptor_reload_delay = ref(2800)
watch(_auto_eruptor_reload_delay, () => {
  ipcRenderer.send('auto_eruptor_reload_delay', _auto_eruptor_reload_delay.value)
})
ipcRenderer.on('auto_eruptor_reload_delay', v => {
  _auto_eruptor_reload_delay.value = v
})
const _auto_crossbow_reload_delay = ref(3300)
watch(_auto_crossbow_reload_delay, () => {
  ipcRenderer.send('auto_crossbow_reload_delay', _auto_crossbow_reload_delay.value)
})
ipcRenderer.on('auto_crossbow_reload_delay', v => {
  _auto_crossbow_reload_delay.value = v
})
const _auto_purifier_reload_delay = ref(2000)
watch(_auto_purifier_reload_delay, () => {
  ipcRenderer.send('auto_purifier_reload_delay', _auto_purifier_reload_delay.value)
})
ipcRenderer.on('auto_purifier_reload_delay', v => {
  _auto_purifier_reload_delay.value = v
})
const _apw_start_rate = ref(240)
watch(_apw_start_rate, () => {
  ipcRenderer.send('apw_start_rate', _apw_start_rate.value)
})
ipcRenderer.on('apw_start_rate', v => {
  _apw_start_rate.value = v
})
const _heavy_rpm = ref(750)
watch(_heavy_rpm, () => {
  ipcRenderer.send('heavy_rpm', _heavy_rpm.value)
})
ipcRenderer.on('heavy_rpm', v => {
  _heavy_rpm.value = v
})
const _heavy_start_rate = ref(240)
watch(_heavy_start_rate, () => {
  ipcRenderer.send('heavy_start_rate', _heavy_start_rate.value)
})
ipcRenderer.on('heavy_start_rate', v => {
  _heavy_start_rate.value = v
})
const _purifier_move_rate = ref(10)
watch(_purifier_move_rate, () => {
  ipcRenderer.send('purifier_move_rate', _purifier_move_rate.value)
})
ipcRenderer.on('purifier_move_rate', v => {
  _purifier_move_rate.value = v
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
const _autorecord = ref(true)
watch(_autorecord, () => {
  ipcRenderer.send('autorecord', _autorecord.value)
})
ipcRenderer.on('autorecord', v => {
  _autorecord.value = v
})
const _record_duration = ref(30)
watch(_record_duration, () => {
  ipcRenderer.send('record_duration', _record_duration.value)
})
ipcRenderer.on('record_duration', v => {
  _record_duration.value = v
})
const _record_framerate = ref(60)
watch(_record_framerate, () => {
  ipcRenderer.send('record_framerate', _record_framerate.value)
})
ipcRenderer.on('record_framerate', v => {
  _record_framerate.value = v
})
const _record_quality = ref(30)
const _record_quality_map = [
  { name: '원본', value: 5 },
  { name: '고화질', value: 19 },
  { name: '균형', value: 30 },
  { name: '웹배포용', value: 40 },
  { name: '저화질', value: 50 }
]
watch(_record_quality, () => {
  ipcRenderer.send('record_quality', _record_quality.value)
})
ipcRenderer.on('record_quality', v => {
  _record_quality.value = v
})
const _deathcam_enabled = ref(true)
watch(_deathcam_enabled, () => {
  ipcRenderer.send('deathcam_enabled', _deathcam_enabled.value)
})
ipcRenderer.on('deathcam_enabled', v => {
  _deathcam_enabled.value = v
})
const _deathcam_seconds = ref(7)
watch(_deathcam_seconds, () => {
  ipcRenderer.send('deathcam_seconds', _deathcam_seconds.value)
})
ipcRenderer.on('deathcam_seconds', v => {
  _deathcam_seconds.value = v
})
const _deathcam_delay = ref(2)
watch(_deathcam_delay, () => {
  ipcRenderer.send('deathcam_delay', _deathcam_delay.value)
})
ipcRenderer.on('deathcam_delay', v => {
  _deathcam_delay.value = v
})
const _deathcam_preview = ref(true)
watch(_deathcam_preview, () => {
  ipcRenderer.send('deathcam_preview', _deathcam_preview.value)
})
ipcRenderer.on('deathcam_preview', v => {
  _deathcam_preview.value = v
})
const _deathcam_size = ref(100)
watch(_deathcam_size, () => {
  ipcRenderer.send('deathcam_size', _deathcam_size.value)
})
ipcRenderer.on('deathcam_size', v => {
  _deathcam_size.value = v
})
const _deathcam_webp = ref(false)
watch(_deathcam_webp, () => {
  ipcRenderer.send('deathcam_webp', _deathcam_webp.value)
})
ipcRenderer.on('deathcam_webp', v => {
  _deathcam_webp.value = v
})
const _output_idx = ref(0)
watch(_output_idx, () => {
  ipcRenderer.send('output_idx', _output_idx.value)
})
ipcRenderer.on('output_idx', v => {
  _output_idx.value = v
})
const _displaylength = ref(1)
ipcRenderer.on('displaylength', v => {
  _displaylength.value = v
})

const _bindkeys = ref({
  reinforce: 'OEM_3',

  rotatekey: 'T',
  rotatekey_reverse: 'H',
  rotate_cancel: 'RBUTTON',
  HANGUL: 'HANGUL',
  mousestratagem: 'SPACE',
  autokey: 'XBUTTON1',
  autokey_sub: 'XBUTTON2',
  autokey_sub2: 'MBUTTON',
  record: 'F1',
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
  _autokey_type_sub.value = v.autokey_type_sub
  _autokey_type_sub2.value = v.autokey_type_sub2
  _autokey_with_goodarmor.value = v.autokey_with_goodarmor
  _auto_arc_delay.value = v.auto_arc_delay
  _auto_railgun_delay.value = v.auto_railgun_delay
  _auto_railgun_reload_delay.value = v.auto_railgun_reload_delay
  _auto_eruptor_delay.value = v.auto_eruptor_delay
  _apw_start_rate.value = v.apw_start_rate
  _heavy_rpm.value = v.heavy_rpm
  _heavy_start_rate.value = v.heavy_start_rate
  _purifier_move_rate.value = v.purifier_move_rate
  _mousestratagem_enabled.value = v.mousestratagem_enabled
  _mousestratagem_with_console.value = v.mousestratagem_with_console
  _mousestratagem_threshold.value = v.mousestratagem_threshold
  _mousestratagem_delay.value = v.mousestratagem_delay
  _autorecord.value = v.autorecord
  _record_duration.value = v.record_duration
  _record_framerate.value = v.record_framerate
  _record_quality.value = v.record_quality
  _deathcam_enabled.value = v.deathcam_enabled
  _deathcam_seconds.value = v.deathcam_seconds
  _deathcam_delay.value = v.deathcam_delay
  _deathcam_preview.value = v.deathcam_preview
  _deathcam_size.value = v.deathcam_size
  _deathcam_webp.value = v.deathcam_webp
  _output_idx.value = v.output_idx
  _displaylength.value = v.displaylength
  _bindkeys.value = v.keyBinds
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

const _key_modal = ref()
const _key_watching = ref()
const _key_watching_key = ref()
const f_set_key = (key, name) => {
  _key_watching.value = key
  ipcRenderer.send('key_watching', key)
  _key_modal.value = name
  _key_watching_key.value = _bindkeys.value[key]
}
ipcRenderer.on('key_watching', v => {
  _key_watching_key.value = v
})
const f_save_key = () => {
  _bindkeys.value[_key_watching.value] = _key_watching_key.value
  if (_key_watching_key.value) ipcRenderer.send('save_bindkeys', { target: _key_watching.value, key: _key_watching_key.value })
  _key_watching.value = null
  _key_watching_key.value = null
  _key_modal.value = null
}
const f_cancel_key = () => {
  _key_modal.value = null
  _key_watching.value = null
  _key_watching_key.value = null
  ipcRenderer.send('cancel_key', true)
}

const f_get_key_string = (key) => {
  const key_string_map = {
    'RBUTTON': '마우스 우클릭',
    'HANGUL': '한/영',
    'SPACE': '스페이스바',
    'MBUTTON': '마우스휠클릭',
    'XBUTTON1': '마우스버튼1',
    'XBUTTON2': '마우스버튼2',
    'XBUTTON3': '마우스버튼3',
    'XBUTTON4': '마우스버튼4',
    'XBUTTON5': '마우스버튼5',
    'XBUTTON6': '마우스버튼6',
    'XBUTTON7': '마우스버튼7',
    'XBUTTON8': '마우스버튼8',
    'LMENU': 'LALT',
    'RMENU': 'RALT',
    'OEM_PERIOD': '.>',
    'OEM_COMMA': '<,',
    'OEM_MINUS': '-_',
    'OEM_PLUS': '+*',
    'OEM_1': ';:',
    'OEM_2': '/?',
    'OEM_3': '`~',
    'OEM_4': '[{',
    'OEM_5': '|\\',
    'OEM_6': '}]',
    'OEM_7': '\'"',
    'OEM_8': '``',
    'ADD': '+',
    'SUBTRACT': '-',
    'MULTIPLY': '*',
    'DIVIDE': '/'
    
  }
  return key_string_map[key] || key
}

const f_open_video_folder = () => {
  ipcRenderer.send('open_video_folder')
}
const f_clear_video_folder = () => {
  ipcRenderer.send('clear_video_folder')
}

const _video_path_size = ref(0)
ipcRenderer.on('video_path_size', v => {
  _video_path_size.value = v
})

const f_format_size = (size) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${size.toFixed(2)} ${units[index]}`
}


const _game_display = ref({})
ipcRenderer.on('game_display', v => {
  _game_display.value = v
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
          .shortcut {
            font-size: 14px;
            font-weight: 300;
            color: rgb(150, 150, 150);
            text-align: right;
            word-break: keep-all;
            min-width: 50px;
            width: 100%;
            cursor: pointer;
            height: 20px;
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
          .unit {
            font-size: 14px;
            color: rgb(150, 150, 150);
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
          .select {
            border: none;
            border-radius: 0;
            background-color: transparent;
            color: rgb(150, 150, 150);
            text-align: right;
            &:focus {
              outline: none;
              box-shadow: none;
            }
            option {
              background: black;
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
            &.disabled {
              pointer-events: none;
              color: rgb(100, 100, 100);
              background: rgba(100, 100, 100, .2);
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
  .key_modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 20px;
    background: rgba(0, 0, 0, .8);
    display: flex;
    justify-content: center;
    align-items: center;

    .inner {
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .title {
        position: absolute;
        left: 80px;
        top: 100px;
        display: flex;
        align-items: center;

        font-size: 40px;
        font-weight: 700;
        .deco {
          width: 7px;
          height: 40px;
          background: rgb(255, 232, 0);
          margin-right: 15px;
        }
      }
      .name {
        font-size: 60px;
        text-align: center;
      }
      .key {
        background: rgb(255, 232, 0);
        color: black;
        padding: 10px 20px;
        min-width: 200px;
        font-size: 60px;
        text-align: center;
        margin-bottom: 70px;
        margin-top: 40px;
      }
      .buttons {
        display: flex;

        justify-content: space-between;
        .button {
          width: 200px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 400;
          cursor: pointer;
          border: 5px solid transparent;
          &.save {
            border-color: rgb(76, 223, 116);
            color: rgb(76, 223, 116);
            background: rgba(76, 223, 116, .1);
          }
          &.cancel {
            border-color: rgb(100, 100, 100);
            color: rgb(100, 100, 100);
            background: rgba(100, 100, 100, .2);
            margin-right: 100px;
          }

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
  .disabled {
    opacity: .5;
    pointer-events: none;
  }
}
</style>

