<template>
  <div class="_modmanager">
    <div class="modgrouplist">
      <div v-for="group in _modgroups">
        <div class="modgroupname">{{ group.name }}</div>
      </div>
    </div>
    <div class="modlist">
      <div class="bottom">
        <div class="button" @click="f_open_mods">새 모드 추가하기</div>
      </div>
    </div>
    <div class="modinfo" v-if="_selected_mod">
      <div class="loadorder">LOAD ORDER</div>
      <div class="meta">MOD INFO</div>
    </div>
    <div class="modgroupinfo" v-else>GROUP INFO</div>
    <div class="add_mod_modal" v-if="_addmod_queue.length > 0">
      <div class="inner">
        <div class="left">
          <div class="title"><div class="deco"/>적용할 모드의 대상을 구분하세요</div>
          <div class="targets">
            <!-- <div class="categories">
              <div class="category">주무기</div>
              <div class="category">보조무기</div>
              <div class="category">투척무기</div>
              <div class="category" style="margin-top: 20px;">경갑</div>
              <div class="category">일반</div>
              <div class="category">중갑</div>
              <div class="category" style="margin-top: 20px;">스트라타젬</div>
            </div> -->
            <div class="items">
              <div class="category" v-for="(d, category) in _modindexdefault">
                <h2 class="categoryname">{{ f_get_category_i18n(category) }}</h2>
                <div class="subcategories">
                  <div class="subcategory" v-for="(dd, subcategory) in d">
                    <h3 class="subcategoryname">{{ f_get_category_i18n(subcategory) }}</h3>
                    <div class="list">
                      <div class="item" v-for="name in dd">
                        <img :class="[category, subcategory]" :src="`/mods/${category}/${subcategory}/${name}.webp`" alt="">
                        <div class="name">{{ name }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="category">
                <h2 class="categoryname">스트라타젬</h2>
                <div class="subcategories">
                  <div class="subcategory" v-for="(d, category) in c_stratagems">
                    <h3 class="subcategoryname">{{ f_get_category_i18n(category) }}</h3>
                    <div class="list">
                      <div class="item" v-for="{ name, icon } in d">
                        <img class="stratagem" :class="[category]" :src="icon" alt="">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
        <div class="meta">
          {{ _addmod_queue[0] }}
          <div class="buttons">
            <div class="button" @click=f_cancel>건너뛰기</div>
            <div class="button">덮어쓰기</div>
            <div class="button">새로 추가하기</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
const _selected_mod = ref()

const _modgroups = ref([
  {
    id: '1232131',
    name: 'test',
    mods: [
      '1432432'
    ]
  }
])

const _modlist = ref({})

const _modindex = ref({})

const _modindexdefault = {
  weapons: {
    primary: [
      'AR-23',
      'AR-23P',
      'AR-23C',
      'AR-23A',
      'AR-61',
      'BR-14',
      'StA-52',
      'R-2124',
      'R-63',
      'R-63CS',
      'PLAS-39',
      'MP-98',
      'StA-11',
      'SMG-32',
      'SMG-37',
      'SMG-72',
      'SG-8',
      'SG-8S',
      'SG-20',
      'SG-451',
      'SG-225',
      'SG-225SP',
      'SG-225IE',
      'CB-9',
      'R-36',
      'SG-8P',
      'ARC-12',
      'LAS-5',
      'LAS-16',
      'LAS-17',
      'PLAS-1',
      'PLAS-101',
      'FLAM-66',
      'JAR-5'
    ],
    secondary: [
      'P-2',
      'P-19',
      'P-4',
      'P-113',
      'LAS-7',
      'PLAS-15',
      'GP-31',
      'SG-22',
      'P-72',
      'P-11',
      'CQC-19',
      'CQC-30',
      'CQC-5'
    ],
    throws: [
      'G-12',
      'G-6',
      'G-10',
      'G-16',
      'G-13',
      'G-3',
      'G-23',
      'G-123',
      'K-2',
      'G-4',
      'G-50'
    ]
  },
  armors: {
    light: [
      'AC-2',
      'AF-50',
      'B-08',
      'CE-07',
      'CE-67',
      'CE-74',
      'CM-21',
      'CW-4',
      'EX-00',
      'FS-37',
      'FS-38',
      'I-09',
      'IE-57',
      'PH-9',
      'SC-30',
      'SC-34',
      'SC-37',
      'SR-24',
      'UF-16'
    ],
    normal: [
      'AC-1',
      'AF-02',
      'AF-91',
      'B-01',
      'B-24',
      'CE-27',
      'CE-35',
      'CE-81',
      'CM-09',
      'CM-10',
      'CM-14',
      'CW-9',
      'DP-00',
      'DP-11',
      'DP-40',
      'DP-53',
      'EX-03',
      'EX-16',
      'FS-34',
      'I-92',
      'I-102',
      'IE-3',
      'IE-12',
      'PH-56',
      'SA-04',
      'SA-12',
      'SA-25',
      'SC-15',
      // 'TR-7',
      // 'TR-9',
      'TR-40',
      'TR-117',
      'UF-50',
      'UF-84'
    ],
    heavy: [
      'AF-52',
      'B-27',
      'CE-64',
      'CE-101',
      'CM-17',
      'CW-22',
      'CW-36',
      'FS-05',
      'FS-11',
      'FS-23',
      'FS-55',
      'FS-61',
      'I-44',
      'PH-202',
      'SA-32',
      'SR-18',
      'SR-64',
      // 'TR-62'
    ]
  }
}
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

const f_get_category_i18n = category => {
  switch (category) {
    case 'weapons':
      return '무기'
    case 'armors':
      return '방어구'
    case 'primary':
      return '주무기'
    case 'secondary':
      return '보조무기'
    case 'throws':
      return '투척무기'
    case 'light':
      return '경갑'
    case 'normal':
      return '일반'
    case 'heavy':
      return '중갑'
    case 'attack':
      return '공격'
    case 'supply':
      return '보급'
    case 'defense':
      return '방어'
    case 'general':
      return '임무'
  }
}

const _addmod_queue = ref([])
const f_open_mods = async () => {
  const res = await ipcRenderer.invoke('open_modfile')
  _addmod_queue.value = res
}
const f_cancel = () => {
  if (_addmod_queue.value.length > 0) {
    _addmod_queue.value.shift()
  }
}
</script>


<style lang="scss" scoped>
._modmanager {
  display: flex;
  width: 100%;
  height: 100%;
  .modgrouplist {
    
  }
  .modlist {
    display: flex;
    flex-direction: column;
    width: 600px;
    align-items: center;
    .bottom {
      display: flex;
      align-items: center;
      .button {
        -webkit-user-drag: none;
        user-drag: none;
        margin: 0 10px;
        width: 200px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: 400;
        cursor: pointer;
        border: 3px solid transparent;
        background: rgb(255, 232, 0);
        color: black;
        font-weight: 600;
        opacity: 1;
      }
    }
  }
  .add_mod_modal {
    position: fixed;
    top: 20px;
    left: 0;
    width: 100%;
    bottom: 0;
    padding: 20px;
    background: rgba(0, 0, 0, .9);
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    .inner {
      padding: 20px;
      display: flex;
      align-items: center;
      width: 95%;
      height: 90%;
      .meta {
        flex-shrink: 0;
      }
      .left {
        display: flex;
        flex-direction: column;
        height: 100%;
        .title {
          margin-bottom: 20px;
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
      }
      .targets {
        position: relative;
        display: flex;
        height: 100%;
        overflow-y: scroll;
        width: 100%;
        .categories {
          flex-shrink: 0;
          margin-right: 20px;
          position: sticky;
          top: 0;
          .category {
            font-size: 24px;
            cursor: pointer;
          }
        }
        .items {
          .category {
            .categoryname {
              margin: 0;
              margin-top: 40px;
            }
            .subcategories {
              display: flex;
              flex-wrap: wrap;
            }
            .list {
              display: flex;
              flex-wrap: wrap;
              .item {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                margin: 5px;
                cursor: pointer;
                border: 2px solid transparent;
                padding: 5px;
                &.selected {
                  border-color: rgb(76, 223, 116);
                }
                img {
                  -webkit-user-drag: none;
                  user-drag: none;
                  object-fit: fill;
                  &.weapons {
                    height: 50px;
                  }
                  &.armors {
                    width: 80px;
                  }
                  &.stratagem {
                    width: 50px;
                  }
                }
                .name {
                  margin-top: 5px;
                }
              }
            }
          }
        }
      }
      .meta {
        width: 300px;
        margin-left: 20px;
        flex-shrink: 0;
      }
    }
  }
}
</style>
