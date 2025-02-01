import { MoveMouse, Key, keyboard, getForegroundWindowHWND, getWindowText, getWindowRect, KeyPress, KeyRelease, KeyPressAndRelease, MouseLeftClick, MouseRightClick, windowFocus, sendText, MouseLeftPress, MouseLeftRelease, MouseRightPress, MouseRightRelease, GetMousePosition } from './src/user32.js'
import { app, BrowserWindow, protocol, net, ipcMain, Notification, Menu, dialog, shell } from 'electron'
import pkg from 'electron-updater'
const { autoUpdater } = pkg
import path from 'path'
import { getCurrentSteamUser, getSteamID64, getSteamInfo, getUserConfigPath, readUserConfig } from './steam.js'
import fs from 'fs'
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const lerp = require('lerp');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const listener_inited = {}
const isDev = process.env.NODE_ENV === 'development'
if (!isDev) Menu.setApplicationMenu(false)

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, supportFetchAPI: true, secure: true } }
])

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

const windows = {}

app.setAppLogsPath()
const logpath = app.getPath('logs')
const userdatapath = app.getPath('userData')

app.commandLine.appendSwitch('use-angle', 'd3d11')
app.commandLine.appendSwitch('enable-gpu')
app.commandLine.appendSwitch('enable-native-gpu-memory-buffers')


let keyBinds = {
  rotatekey: 'T',
  rotatekey_reverse: 'H',
  rotate_cancel: 'RBUTTON',

  chat: 'RETURN',
  escape: 'ESCAPE',
  fire: 'LBUTTON',
  sprint: 'LSHIFT',
  dive: 'LMENU',

  move_forward: 'W',
  move_back: 'S',
  move_left: 'A',
  move_right: 'D',

  stratagem_console: 'LCONTROL',

  weapon_1: '1',
  weapon_2: '2',
  weapon_3: '3',
  weapon_4: '4',
  weapon_5: '5',
  granade: 'G',
  heal: 'V',

  reload: 'R',

  weapon_swap: null,

  weapon_function: 'R',
  map: 'TAB',
  dropopen: 'X',
  cinematic_mode: null,

  reinforce: 'OEM_3',

  up: 'W',
  down: 'S',
  left: 'A',
  right: 'D',

  HANGUL: 'HANGUL',

  autokey: 'XBUTTON1',

  mousestratagem: 'SPACE'
}

const settingPath = path.join(userdatapath, 'user.settings.json')
let settings = {}
const saveSetting = () => {
  if (!fs.existsSync(settingPath)) fs.writeFileSync(settingPath, '{}')
  fs.writeFileSync(settingPath, JSON.stringify(settings))
}

let instantfire = true
ipcMain.on('instantfire', (_, value) => {
  instantfire = value
  settings.instantfire = instantfire
  saveSetting()
})
let instantfire_delay = 1000
ipcMain.on('instantfire_delay', (_, value) => {
  instantfire_delay = parseInt(value) || 0
  settings.instantfire_delay = instantfire_delay
  saveSetting()
})
let inputDelay = 30
ipcMain.on('inputDelay', (_, value) => {
  inputDelay = parseInt(value) || 0
  settings.inputDelay = inputDelay
  saveSetting()
})
let chatinputdelay = 5
ipcMain.on('chatinputdelay', (_, value) => {
  chatinputdelay = parseInt(value) || 0
  settings.chatinputdelay = chatinputdelay
  saveSetting()
})
let rotate_delay = 300
ipcMain.on('rotate_delay', (_, value) => {
  rotate_delay = parseInt(value) || 0
  settings.rotate_delay = rotate_delay
  saveSetting()
})
let instant_chat = true
ipcMain.on('instant_chat', (_, value) => {
  instant_chat = value
  settings.instant_chat = instant_chat
  saveSetting()
})
let cinematic_mode = false
ipcMain.on('cinematic_mode', (_, value) => {
  cinematic_mode = value
  settings.cinematic_mode = cinematic_mode
  saveSetting()
  try {
    windows.overlay.webContents.send('cinematic_mode', cinematic_mode)
  } catch (e) {}
})

let autokey_enabled = false
ipcMain.on('autokey_enabled', (_, value) => {
  autokey_enabled = value
  settings.autokey_enabled = autokey_enabled
  saveSetting()
})
let autokey_type = ''
ipcMain.on('autokey_type', (_, value) => {
  autokey_type = value
  settings.autokey_type = autokey_type
  saveSetting()
})

let auto_arc_delay = 1100
ipcMain.on('auto_arc_delay', (_, value) => {
  auto_arc_delay = value
  settings.auto_arc_delay = auto_arc_delay
  saveSetting()
})
let auto_railgun_delay = 2900
ipcMain.on('auto_railgun_delay', (_, value) => {
  auto_railgun_delay = value
  settings.auto_railgun_delay = auto_railgun_delay
  saveSetting()
})
let auto_railgun_reload_delay = 1000
ipcMain.on('auto_railgun_reload_delay', (_, value) => {
  auto_railgun_reload_delay = value
  settings.auto_railgun_reload_delay = auto_railgun_reload_delay
  saveSetting()
})
let auto_eruptor_delay = 400
ipcMain.on('auto_eruptor_delay', (_, value) => {
  auto_eruptor_delay = value
  settings.auto_eruptor_delay = auto_eruptor_delay
  saveSetting()
})
let apw_start_rate = 240
ipcMain.on('apw_start_rate', (_, value) => {
  apw_start_rate = parseInt(value) || 0
  settings.apw_start_rate = apw_start_rate
  saveSetting()
})
let mousestratagem_enabled = false
ipcMain.on('mousestratagem_enabled', (_, value) => {
  mousestratagem_enabled = value
  settings.mousestratagem_enabled = mousestratagem_enabled
  saveSetting()
})
let mousestratagem_with_console = false
ipcMain.on('mousestratagem_with_console', (_, value) => {
  mousestratagem_with_console = value
  settings.mousestratagem_with_console = mousestratagem_with_console
  saveSetting()
})
let mousestratagem_threshold = 50
ipcMain.on('mousestratagem_threshold', (_, value) => {
  mousestratagem_threshold = parseInt(value) || 0
  settings.mousestratagem_threshold = mousestratagem_threshold
  saveSetting()
})
let mousestratagem_delay = 100
ipcMain.on('mousestratagem_delay', (_, value) => {
  mousestratagem_delay = parseInt(value) || 0
  settings.mousestratagem_delay = mousestratagem_delay
  saveSetting()
})

if (fs.existsSync(settingPath)) {
  settings = JSON.parse(fs.readFileSync(settingPath, 'utf8'))
  if (settings.instantfire !== undefined) instantfire = settings.instantfire
  if (settings.instantfire_delay !== undefined) instantfire_delay = settings.instantfire_delay
  if (settings.inputDelay !== undefined) inputDelay = settings.inputDelay
  if (settings.chatinputdelay !== undefined) chatinputdelay = settings.chatinputdelay
  if (settings.rotate_delay !== undefined) rotate_delay = settings.rotate_delay
  if (settings.instant_chat !== undefined) instant_chat = settings.instant_chat
  if (settings.cinematic_mode !== undefined) cinematic_mode = settings.cinematic_mode
  if (settings.autokey_enabled !== undefined) autokey_enabled = settings.autokey_enabled
  if (settings.autokey_type !== undefined) autokey_type = settings.autokey_type
  if (settings.auto_arc_delay !== undefined) auto_arc_delay = settings.auto_arc_delay
  if (settings.auto_railgun_delay !== undefined) auto_railgun_delay = settings.auto_railgun_delay
  if (settings.auto_railgun_reload_delay !== undefined) auto_railgun_reload_delay = settings.auto_railgun_reload_delay
  if (settings.auto_eruptor_delay !== undefined) auto_eruptor_delay = settings.auto_eruptor_delay
  if (settings.apw_start_rate !== undefined) apw_start_rate = settings.apw_start_rate
  if (settings.mousestratagem_enabled !== undefined) mousestratagem_enabled = settings.mousestratagem_enabled
  if (settings.mousestratagem_with_console !== undefined) mousestratagem_with_console = settings.mousestratagem_with_console
  if (settings.mousestratagem_threshold !== undefined) mousestratagem_threshold = settings.mousestratagem_threshold
  if (settings.mousestratagem_delay !== undefined) mousestratagem_delay = settings.mousestratagem_delay
}

let stratagemRunning = false
let stratagemPending = false
let stratagemReady = false
let stratagemsets = []

// Hold(누르고있기), Press(누르기.기본(탭, 더블탭 포함)), LongPress(길게누르기)
let stratagem_key_type = 'Hold'
let weapon_function_key_type = 'LongPress'
let map_key_type = 'Press'
let dropopen_key_type = ''


const bindHelldivers2Key = key => {
  if (!key) return null
  const abkey = key.toUpperCase().trim()

  let reskey

  switch (abkey) {
    case 'OPEN BRACKET':
      reskey = 'OEM_4'
      break
    case 'CLOSE BRACKET':
      reskey = 'OEM_6'
      break
    case 'LEFT SHIFT':
      reskey = 'LSHIFT'
      break
    case 'RIGHT SHIFT':
      reskey = 'RSHIFT'
      break
    case 'LEFT CTRL':
      reskey = 'LCONTROL'
      break
    case 'RIGHT CTRL':
      reskey = 'RCONTROL'
      break
    case 'LEFT ALT':
      reskey = 'LMENU'
      break
    case 'RIGHT ALT':
      reskey = 'RMENU'
      break
    case 'NUMPAD 0':
    case 'NUMPAD 1':
    case 'NUMPAD 2':
    case 'NUMPAD 3':
    case 'NUMPAD 4':
    case 'NUMPAD 5':
    case 'NUMPAD 6':
    case 'NUMPAD 7':
    case 'NUMPAD 8':
    case 'NUMPAD 9':
      reskey = `NUMPAD${abkey.slice(-1)}`
      break
    default:
      reskey = abkey
      break
  }
  if (Key[reskey]) return reskey
  return null
}

let dynamic_interval_stopper = false
let gameId = '553850'
let steamID64
let gamePath
let username
let configPath
let configInfo
setInterval(async () => {
  if (dynamic_interval_stopper) return
  if (!steamID64 || !gamePath || !username || !configPath) {
    try {
      steamID64 = await getSteamID64()
      gamePath = await getUserConfigPath(steamID64, gameId)
      username = await getCurrentSteamUser()
      configPath = await getUserConfigPath(steamID64, gameId)
    } catch (e) {
      windows.main.webContents.send('steaminfo', { error: e })
    }
  }
  try {
    const before = JSON.stringify(keyBinds)
    configInfo = await readUserConfig(steamID64, gameId, configPath)
    if (configInfo?.json) {
      const { json } = configInfo
      const { Stratagem, Avatar, Player, Misc } = json || {}
      if (Avatar?.Sprint) {
        const setting = Avatar.Sprint.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting.input)
        if (newkey) keyBinds['sprint'] = newkey
      }
      if (Player?.OpenChat) {
        const setting = Player.OpenChat.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting.input)
        if (newkey) keyBinds['chat'] = newkey
      }
      if (Avatar?.ChangeEquipmentContextSensitiveShort) {
        const setting = Avatar.ChangeEquipmentContextSensitiveShort.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting.input)
        if (newkey) keyBinds['weapon_swap'] = newkey
      }
      if (Avatar?.ChangeEquipmentPrimary) {
        const setting = Avatar.ChangeEquipmentPrimary.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting.input)
        if (newkey) keyBinds['weapon_1'] = newkey
      }
      if (Avatar?.ChangeEquipmentSecondary) {
        const setting = Avatar.ChangeEquipmentSecondary.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting.input)
        if (newkey) keyBinds['weapon_2'] = newkey
      }
      if (Avatar?.ChangeEquipmentSupport) {
        const setting = Avatar.ChangeEquipmentTertiary.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting.input)
        if (newkey) keyBinds['weapon_3'] = newkey
      }
      if (Avatar?.ChangeEquipmentGrenade) {
        const setting = Avatar.ChangeEquipmentGrenade.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting.input)
        if (newkey) keyBinds['weapon_4'] = newkey
      }
      if (Avatar?.BackpackFunction) {
        const setting = Avatar.BackpackFunction.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting.input)
        if (newkey) keyBinds['weapon_5'] = newkey
      }
      if (Avatar?.ChangeEquipmentQuickGrenade) {
        const setting = Avatar.ChangeEquipmentQuickGrenade.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting.input)
        if (newkey) keyBinds['granade'] = newkey
      }
      if (Avatar?.QuickStim) {
        const setting = Avatar.QuickStim.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting.input)
        if (newkey) keyBinds['heal'] = newkey
      }
      if (Avatar?.WeaponFunctionOpen) {
        const setting = Avatar.WeaponFunctionOpen.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting.input)
        if (newkey) keyBinds['weapon_function'] = newkey
        weapon_function_key_type = setting.trigger
      }
      if (Avatar?.Map) {
        const setting = Avatar.Map.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting.input)
        if (newkey) keyBinds['map'] = newkey
        map_key_type = setting.trigger
      }
      if (Misc?.ToggleHudVisibility) {
        const setting = Misc.ToggleHudVisibility.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting.input)
        if (newkey) keyBinds['cinematic_mode'] = newkey
      }
      if (Avatar?.DropOpen) {
        const setting = Avatar.DropOpen.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting.input)
        if (newkey) keyBinds['dropopen'] = newkey
        dropopen_key_type = setting.trigger
      }
      if (Avatar?.Dodge) {
        const setting = Avatar.Dodge.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting.input)
        if (newkey) keyBinds['dive'] = newkey
      }
      if (Avatar?.Reload) {
        const setting = Avatar.Reload.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting.input)
        if (newkey) keyBinds['reload'] = newkey
      }
      if (Avatar?.MoveForward) {
        const setting = Avatar.MoveForward.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting.input)
        if (newkey) keyBinds['move_forward'] = newkey
      }
      if (Avatar?.MoveBack) {
        const setting = Avatar.MoveBack.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting.input)
        if (newkey) keyBinds['move_back'] = newkey
      }
      if (Avatar?.MoveLeft) {
        const setting = Avatar.MoveLeft.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting.input)
        if (newkey) keyBinds['move_left'] = newkey
      }
      if (Avatar?.MoveRight) {
        const setting = Avatar.MoveRight.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting.input)
        if (newkey) keyBinds['move_right'] = newkey
      }
      for (const [ key, value ] of Object.entries(Stratagem || {})) {
        const setting = value.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting.input)
        if (!newkey) continue
        switch (key) {
          case 'Up':
            keyBinds['up'] = newkey
            break
          case 'Down':
            keyBinds['down'] = newkey
            break
          case 'Left':
            keyBinds['left'] = newkey
            break
          case 'Right':
            keyBinds['right'] = newkey
            break
          case 'Start':
            keyBinds['stratagem_console'] = newkey
            stratagem_key_type = setting.trigger
            break
        }
      }
    }
    if (before != JSON.stringify(keyBinds)) {
      windows.main.webContents.send('keyBinds', keyBinds)
      stratagemPending = false
      windows.main.webContents.send('steaminfo', { username, steamID64, gamePath, configPath, configInfo })
    }
  } catch (e) {
    windows.main.webContents.send('steaminfo', { username, steamID64, gamePath, configPath })
  }
}, 2000)

const createMainWindow = () => {
  windows.main = new BrowserWindow({
    width: 1600,
    height: 900,
    titleBarStyle: 'hidden',
    minWidth: 1600,
    minHeight: 900,
    title: "Helldivers2 Helper",
    transparent: true,
    show: false,
    webPreferences: {
      preload: path.join(app.getAppPath(), '/preload.js')
    },
    icon: path.join(app.getAppPath(), 'icon.png')
  })

  windows.main.on('closed', () => {
    app.quit()
  })
  windows.main.on('page-title-updated', (evt) => {
    evt.preventDefault()
  })

  windows.overlay = new BrowserWindow({
    width: 1280,
    height: 900,
    titleBarStyle: 'hidden',
    title: "Helldivers2 Overlay",
    transparent: true,
    show: false,
    webPreferences: {
      preload: path.join(app.getAppPath(), '/preload.js'),
      backgroundThrottling: false
    },
    icon: path.join(app.getAppPath(), 'icon.png'),
    frame: false,
    alwaysOnTop: true,
    alwaysOnTopMonotonic: true,
    skipTaskbar: true,
    resizable: false 
  })

  windows.chat = new BrowserWindow({
    width: 400,
    height: 300,
    titleBarStyle: 'hidden',
    title: "Helldivers2 Chat",
    transparent: true,
    show: false,
    webPreferences: {
      preload: path.join(app.getAppPath(), '/preload.js')
    },
    icon: path.join(app.getAppPath(), 'icon.png'),
    frame: false,
    focusable: true,
    skipTaskbar: true,
    resizable: false
  })
  windows.chat.on('page-title-updated', (evt) => {
    evt.preventDefault()
  })

  windows.main.loadURL(isDev ? 'http://localhost:3000' : 'app://dist/index.html')
  windows.overlay.loadURL(isDev ? 'http://localhost:3000' : 'app://dist/index.html')
  windows.chat.loadURL(isDev ? 'http://localhost:3000' : 'app://dist/index.html')

  windows.main.on('maximize', () => {
    windows.main.webContents.send('maximized', true)
  })
  windows.main.on('unmaximize', () => {
    windows.main.webContents.send('maximized', false)
  })
  windows.main.on('minimize', () => {
  })
  windows.main.on('restore', () => {
  })

  ipcMain.on('minimize', (e, m) => {
    windows.main.minimize()
  })
  ipcMain.on('maximize', (e, m) => {
    windows.main.maximize()
  })
  ipcMain.on('unmaximize', (e, m) => {
    windows.main.unmaximize()
  })
  ipcMain.on('close', (e, m) => {
    windows.main.close()
  })

  ipcMain.on('initRoute', () => {
    windows.main.webContents.send('initRoute', '/main')
    windows.overlay.webContents.send('initRoute', '/overlay')
    windows.chat.webContents.send('initRoute', '/chat')
  })

  ipcMain.on('stratagemsets', (_, array) => {
    stratagemsets = array
    windows.overlay.webContents.send('stratagemsets', stratagemsets)
  })

  ipcMain.on('open_config_path', (_, __) => {
    try {
      shell.openPath(configPath.replace('\\input_settings.config', ''))
    } catch (e) {
      console.log(e)
    }
  })

  const stratagemQueue = []
  let queueRunning = false
  const stratagemQueueRun = async () => {
    if (queueRunning) return
    queueRunning = true
    dynamic_interval_stopper = true
    while (stratagemQueue.length) {
      await stratagemQueue.shift()()
      if (instantfire) {
        await sleep(instantfire_delay)
        if (cinematic_mode) {
          cancelable_acting = false
          await cinematic_input_queue_run()
        }
      }
    }
    dynamic_interval_stopper = false
    queueRunning = false
  }

  const inputFire = async (delay = inputDelay, type = 'click') => {
    switch (keyBinds['fire']) {
      case 'LBUTTON':
        if (type == 'press') await MouseLeftPress()
        else if (type == 'release') await MouseLeftRelease()
        else await MouseLeftClick(delay)
        break
      case 'RBUTTON':
        if (type == 'press') await MouseRightPress()
        else if (type == 'release') await MouseRightRelease()
        else await MouseRightClick(delay)
        break
      default:
        if (type == 'press') await KeyPress(keyBinds['fire'])
        else if (type == 'release') await KeyRelease(keyBinds['fire'])
        else await KeyPressAndRelease(keyBinds['fire'], delay)
        break
    }
  }
  const waitforrotatefree = async () => {
    while (keyboard.status[keyBinds['rotatekey']] || keyboard.status[keyBinds['rotatekey_reverse']]) {
      await sleep(1000 / 120)
    }
  }
  const inputStratagem = async (stratagem, delay = inputDelay) => {
    if (mouse_stratagem_state) {
      mouse_stratagem_state = false
      windows.overlay.webContents.send('mouse_stratagem_state', false)
    }
    const { promise, resolve } = Promise.withResolvers()
    stratagemQueue.push(async () => {
      if (!stratagem?.keys || !stratagem?.keys.length) return
      stratagemRunning = true
      const freekeys = []
      if (keyboard.status[keyBinds['sprint']]) {
        freekeys.push(keyBinds['sprint'])
        await KeyRelease(keyBinds['sprint'])
      }
      if (keyboard.status[keyBinds['up']]) {
        freekeys.push(keyBinds['up'])
        await KeyRelease(keyBinds['up'])
      }
      if (keyboard.status[keyBinds['down']]) {
        freekeys.push(keyBinds['down'])
        await KeyRelease(keyBinds['down'])
      }
      if (keyboard.status[keyBinds['left']]) {
        freekeys.push(keyBinds['left'])
        await KeyRelease(keyBinds['left'])
      }
      if (keyboard.status[keyBinds['right']]) {
        freekeys.push(keyBinds['right'])
        await KeyRelease(keyBinds['right'])
      }
      await waitforrotatefree()
      await KeyPress(keyBinds['stratagem_console'])
      await sleep(delay)
      for (const key of stratagem.keys) {
        await sleep(delay)
        await waitforrotatefree()
        await KeyPressAndRelease(keyBinds[key], delay)
      }
      await KeyRelease(keyBinds['stratagem_console'])
      await sleep(delay)
      stratagemRunning = false
      stratagemReady = stratagem
      if (stratagem.instant) {
        stratagemReady.lastFire = Date.now()
        windows.overlay.webContents.send('stratagemFire', stratagemReady)
        stratagemReady = false
      } else {
        if (instantfire) {
          await inputFire(delay)
          await sleep(delay)
        }
      }
      for (const key of freekeys) {
        await KeyPress(key)
      }
      resolve()
    })
    stratagemQueueRun()
    return await promise
  }

  let stratagemCount = -1
  let stratagemCountListener

  let chatInputting = false
  ipcMain.on('chatInput', async (_, chat) => {
    if (chatInputting) return
    windows['chat'].setIgnoreMouseEvents(true)
    chatInputting = true
    await windowFocus(gameHWND)
    while (!focuswindowIsGame()) {
      await sleep(1000 / 24)
    }
    pendingDuringChatKey = true
    if (chat) await sendText(chat, chatinputdelay)
    await KeyPressAndRelease(keyBinds['chat'])
    windows.chat.setIgnoreMouseEvents(true)
    await sleep(chatinputdelay)
    if (cinematic_mode) {
      await sleep(inputDelay)
      await cinematic_input_queue_run()
    }
    pendingDuringChatKey = false
    chatInputting = false
    stratagemPending = false
    stratagemReady = false
  })
  ipcMain.handle('chatInputInit', async () => {
    windows['chat'].setIgnoreMouseEvents(false)
    await KeyPressAndRelease('I')
    return true
  })
  ipcMain.handle('pressHangul', async () => {
    await KeyRelease('HANGUL')
    await KeyPressAndRelease('HANGUL')
    return true
  })

  const long_delay_listeners = {}
  let cancelable_acting = false
  let map_opened = false
  let stratagem_opened = false
  let cinematic_state = true
  let pendingDuringChatKey = false
  const cinematic_input_queue = []
  const cinematic_input_queue_run = async () => {
    const { promise, resolve } = Promise.withResolvers()
    cinematic_input_queue.push(() => resolve())
    return await promise
  }
  const cinematic_input_queue_engine = async () =>{
    if (cinematic_input_queue.length) {
      cinematic_state = !cinematic_state
      await KeyPressAndRelease(keyBinds['cinematic_mode'], inputDelay)
      if (cinematic_input_queue[0]) {
        cinematic_input_queue[0]()
        cinematic_input_queue.splice(0, 1)
      }
    }
    await sleep(inputDelay)
    cinematic_input_queue_engine()
  }
  cinematic_input_queue_engine()

  let mouse_stratagem_state = false
  let last_mouse_stratagem_point = null
  const mouse_stratagem_engine = async () => {
    if (!mouse_stratagem_state) {
      await sleep(1000 / 60)
      mouse_stratagem_engine()
      return
    }
    if (!last_mouse_stratagem_point) last_mouse_stratagem_point = await GetMousePosition()
    else {
      const current = await GetMousePosition()
            
      // 마우스 이동 방향 계산
      const dx = current.x - last_mouse_stratagem_point.x
      const dy = current.y - last_mouse_stratagem_point.y
      
      // 가장 큰 이동 방향 찾기 (방향 수정)
      const directions = [
        { key: 'up', value: dy < 0 ? Math.abs(dy) : 0 },     // 위로 이동
        { key: 'down', value: dy > 0 ? Math.abs(dy) : 0 },   // 아래로 이동
        { key: 'left', value: dx < 0 ? Math.abs(dx) : 0 },   // 왼쪽으로 이동
        { key: 'right', value: dx > 0 ? Math.abs(dx) : 0 }   // 오른쪽으로 이동
      ]
      
      // 절대값이 가장 큰 방향을 찾음
      const mainDirection = directions.reduce((prev, curr) => 
        curr.value > prev.value ? curr : prev
      )
      
      if (mainDirection.value > mousestratagem_threshold) {
        await KeyPressAndRelease(keyBinds[mainDirection.key], inputDelay)
        await sleep(mousestratagem_delay)
        last_mouse_stratagem_point = null
      } else {
        await sleep(1000 / 60)
      }
    }
    mouse_stratagem_engine()
  }
  mouse_stratagem_engine()

  const initEngine = async () => {
    keyboard.on('EVERY', async ({ key, state }) => {
      if (focuswindow == 'Helldivers2 Chat') {
        if (state) {
          if (key == 'TAB' && (keyboard.status['LMENU'] || keyboard.status['RMENU'] || keyboard.status['MENU'] )) {
            windows.chat.webContents.send('chatInput', false)
          }
        }
      }
      if (!focuswindowIsGame()) return

      if (key == keyBinds['stratagem_console'] && state) {
        if (map_opened) return
        if (stratagem_key_type == 'Hold') {
          if (cinematic_mode) await cinematic_input_queue_run()
          stratagem_opened = true
          if (mousestratagem_with_console) {
            mouse_stratagem_state = stratagem_opened
            windows.overlay.webContents.send('mouse_stratagem_state', stratagem_opened)
          }
        }
        return
      }
      if (key == keyBinds['stratagem_console'] && !state) {
        if (map_opened) return
        if (cinematic_mode) await cinematic_input_queue_run()
        if (stratagem_key_type == 'Hold') {
          cancelable_acting = false
          stratagem_opened = false
        }
        else {
          cancelable_acting = !cancelable_acting
          stratagem_opened = !stratagem_opened
        }
        if (mousestratagem_with_console) {
          if (stratagem_key_type == 'Hold') {
            mouse_stratagem_state = stratagem_opened
            windows.overlay.webContents.send('mouse_stratagem_state', stratagem_opened)
          } else {
            mouse_stratagem_state = stratagem_opened
            windows.overlay.webContents.send('mouse_stratagem_state', stratagem_opened)
          }
          return
        }
      }

      if (key == keyBinds['mousestratagem']) {
        if (!mousestratagem_enabled) return
        if (mousestratagem_with_console && stratagem_opened) return
        if (state) {
          mouse_stratagem_state = true
          windows.overlay.webContents.send('mouse_stratagem_state', true)
        } else {
          last_mouse_stratagem_point = null
          mouse_stratagem_state = false
          windows.overlay.webContents.send('mouse_stratagem_state', false)
        }
        return
      }

      if (key == keyBinds['autokey']) {
        if (state && auto_reloading) return
        autokey_enabled = state
        if (autokey_type == 'railgun' && !state && railgun_fired) {
          if (keyboard.status[keyBinds['fire']]) await inputFire(0, 'release')
          await sleep(inputDelay)
          await KeyPressAndRelease(keyBinds['reload'], inputDelay)
        }
        if (!state && keyboard.status[keyBinds['fire']]) {
          await inputFire(0, 'release')
        }
        return
      } else {
        switch (key) {
          case keyBinds['map']:
          case keyBinds['dropopen']:
          case keyBinds['chat']:
          case keyBinds['dive']:
          case keyBinds['stratagem_console']:
            autokey_enabled = false
            break
        }
      }
      switch (key) {
        case keyBinds['map']:
        case keyBinds['dropopen']:
        case keyBinds['chat']:
        case keyBinds['dive']:
        case keyBinds['fire']:
        case keyBinds['rotatekey']:
        case keyBinds['rotatekey_reverse']:
        case keyBinds['rotate_cancel']:
        case keyBinds['weapon_1']:
        case keyBinds['weapon_2']:
        case keyBinds['weapon_3']:
        case keyBinds['weapon_4']:
        case keyBinds['weapon_5']:
        case keyBinds['granade']:
        case keyBinds['heal']:
        case keyBinds['reload']:
        case keyBinds['weapon_swap']:
        case keyBinds['weapon_function']:
        case keyBinds['reinforce']:
        case keyBinds['HANGUL']:
        case keyBinds['autokey']:
          mouse_stratagem_state = false
          windows.overlay.webContents.send('mouse_stratagem_state', false)
          break;
      }
      switch (key) {
        case keyBinds['fire']:
          stratagem_opened = false
          break
      }

      if (cinematic_mode) {
        if (key == keyBinds['dive'] && !state) {
          if (cancelable_acting) {
            cancelable_acting = false
            map_opened = false
            stratagem_opened = false
            await cinematic_input_queue_run()
            return
          }
        }

        if (key == keyBinds['weapon_function'] && state) {
          if (stratagem_opened || map_opened) return
          if (weapon_function_key_type == 'LongPress' || weapon_function_key_type == 'Press') {
            if (long_delay_listeners[keyBinds['weapon_function']]) return
            long_delay_listeners[keyBinds['weapon_function']] = setTimeout(async () => {
              long_delay_listeners[keyBinds['weapon_function']] = null
              await cinematic_input_queue_run()
            }, weapon_function_key_type == 'LongPress' ? 300 : 50)
          } else {
            cancelable_acting = true
          }
          return
        }
        if (key == keyBinds['weapon_function'] && !state) {
          if (stratagem_opened || map_opened) return
          if (weapon_function_key_type == 'LongPress' || weapon_function_key_type == 'Press') {
            if (long_delay_listeners[keyBinds['weapon_function']]) {
              clearTimeout(long_delay_listeners[keyBinds['weapon_function']])
              long_delay_listeners[keyBinds['weapon_function']] = null
            } else {
              if (!cinematic_state) {
                await KeyRelease(keyBinds['weapon_function'])
                await cinematic_input_queue_run()
              }
            }
          } else {
            await cinematic_input_queue_run()
          }
          cancelable_acting = false
          return
        }
        
        if (key == keyBinds['dropopen'] && state) {
          if (stratagem_opened || map_opened) return
          await cinematic_input_queue_run()
          return
        }
        if (key == keyBinds['dropopen'] && !state) {
          if (stratagem_opened || map_opened) return
          await cinematic_input_queue_run()
          return
        }
      }

      if (key == keyBinds['map'] && state) {
        if (stratagem_opened) return
        if (map_key_type == 'Hold') {
          if (cinematic_mode && !stratagem_opened) await cinematic_input_queue_run()
          map_opened = true
          stratagem_opened = false
        }
        return
      }
      if (key == keyBinds['map'] && !state) {
        if (stratagem_opened)  {
          stratagem_opened = false
          map_opened = true
          cancelable_acting = true
          return
        }
        if (cinematic_mode) await cinematic_input_queue_run()
        if (map_key_type == 'Hold') {
          cancelable_acting = false
          map_opened = false
        }
        else {
          cancelable_acting = !cancelable_acting
          map_opened = !map_opened
        }
        return
      }


      if (key == keyBinds['rotatekey']) {
        // if (stratagemRunning || stratagemPending) return
        if (state) {
          stratagemCount++
          if (stratagemCount > stratagemsets.length - 1) stratagemCount = 0
          windows.overlay.webContents.send('stratagemFocus', stratagemCount)
          if (stratagemCountListener) clearTimeout(stratagemCountListener)
        } else {
          if (stratagemCountListener) clearTimeout(stratagemCountListener)
          stratagemCountListener = setTimeout(async () => {
            const target = stratagemsets[stratagemCount]
            stratagemCount = -1
            if (target) {
              windows.overlay.webContents.send('stratagemFocus', -1)
              await inputStratagem(target)
            }
            windows.overlay.webContents.send('stratagemFocus', stratagemCount)
          }, rotate_delay)
        }
        return
      }
      if (key == keyBinds['rotatekey_reverse']) {
        // if (stratagemRunning || stratagemPending) return
        if (state) {
          stratagemCount--
          if (stratagemCount < 0) stratagemCount = stratagemsets.length - 1
          windows.overlay.webContents.send('stratagemFocus', stratagemCount)
          if (stratagemCountListener) clearTimeout(stratagemCountListener)
        } else {
          if (stratagemCountListener) clearTimeout(stratagemCountListener)
          stratagemCountListener = setTimeout(async () => {
            const target = stratagemsets[stratagemCount]
            stratagemCount = -1
            if (target) {
              windows.overlay.webContents.send('stratagemFocus', -1)
              await inputStratagem(target)
            }
            windows.overlay.webContents.send('stratagemFocus', stratagemCount)
          }, rotate_delay)
        }
        return
      }
      if (key == keyBinds['rotate_cancel']) {
        stratagemPending = false
        stratagemCount = -1
        if (stratagemCountListener) clearTimeout(stratagemCountListener)
        windows.overlay.webContents.send('stratagemFocus', stratagemCount)
        return
      }
    })
  }

  let gameHWND
  let focuswindow
  const focuswindowIsGame = () => focuswindow == 'HELLDIVERS™ 2'
  setInterval(async () => {
    if (dynamic_interval_stopper) return
    try {
      const HWND = await getForegroundWindowHWND()
      const text = await getWindowText(HWND)
      focuswindow = text
      const rect = await getWindowRect(HWND)
      if (text == 'HELLDIVERS™ 2') {
        if (!windows['overlay'].isVisible()) windows['overlay'].show()
        if (!windows['chat'].isVisible()) windows['chat'].show()

        gameHWND = HWND
        windows['overlay'].setAlwaysOnTop(true, 'screen-saver')
        windows['overlay'].setIgnoreMouseEvents(true)
        windows['overlay'].setSize(rect.width, parseInt(rect.height / 5))
        windows['overlay'].setPosition(rect.x, rect.y + rect.height - parseInt(rect.height / 5))
        windows['overlay'].webContents.send('visible', true)
        windows['overlay'].webContents.send('cinematic_mode', cinematic_mode)

        if (!windows['chat'].inited) {
          windows['chat'].setSize(parseInt(rect.height / 3), 40)
          windows['chat'].setPosition(rect.x + parseInt(rect.width - rect.height / 40 - rect.height / 3), rect.y + parseInt(rect.height - rect.height / 13 - 40))
          windows['chat'].inited = true
        }
      } else {
        windows['overlay'].webContents.send('visible', false)
      }
    } catch (e) {}
  }, 1000 / 6)

  const enginerunning = () => {
    const isgame = focuswindowIsGame()
    if (!isgame) autokey_enabled = false
    return autokey_enabled && autokey_type
  }
  let lastusedweapon = 1
  const eunginesleep = async (ms) => {
    const now = Date.now()
    const end = now + ms
    while (Date.now() + inputDelay < end) {
      if (!enginerunning()) break
      await sleep(inputDelay)
    }
  }
  let railgun_fired = false
  let apw_start = apw_start_rate
  let apw_counts = 0
  let auto_reloading = false
  const autokey_engine = async () => {
    if (!enginerunning()) {
      await sleep(1000 / 60)
      apw_start = apw_start_rate
      apw_counts = 0
      autokey_engine()
      return
    }
    switch (autokey_type) {
      case 'arc':
        // console.time('arc')
        await inputFire(0, 'press')
        if (!enginerunning()) break
        await eunginesleep(auto_arc_delay)
        if (!enginerunning()) break
        await inputFire(0, 'release')
        await sleep(inputDelay)
        // console.timeEnd('arc')
        break
      case 'railgun':
        await inputFire(0, 'press')
        railgun_fired = true
        if (!enginerunning()) break
        await eunginesleep(auto_railgun_delay)
        if (!enginerunning()) break
        await inputFire(0, 'release')
        if (!enginerunning()) break
        await sleep(inputDelay)
        if (!enginerunning()) break
        railgun_fired = false
        auto_reloading = true
        await KeyPressAndRelease(keyBinds['reload'], inputDelay)
        await sleep(auto_railgun_reload_delay)
        auto_reloading = false
        break
      case 'eruptor':
        if (lastusedweapon != 1) {
          await KeyPressAndRelease(keyBinds['weapon_1'], inputDelay)
          await sleep(auto_eruptor_delay * 2)
        }
        await inputFire(inputDelay)
        await sleep(inputDelay)
        if (!enginerunning()) break
        await KeyPressAndRelease(keyBinds['weapon_swap'], inputDelay)
        await sleep(auto_eruptor_delay)
        await KeyPressAndRelease(keyBinds['weapon_swap'], inputDelay)
        await sleep(auto_eruptor_delay)
        break
      case 'apw':
        await inputFire(inputDelay)
        let recover = Date.now() + (150 - inputDelay) // 400rpm = 150ms
        if (keyboard.status[keyBinds['move_forward']] ||
            keyboard.status[keyBinds['move_back']] ||
            keyboard.status[keyBinds['move_left']] ||
            keyboard.status[keyBinds['move_right']]
        ) {
          apw_start *= 1.3
        }
        await MoveMouse(0, parseInt(apw_start))
        apw_start /= 2
        apw_counts++
        if (apw_counts < 7) {
          while (Date.now() + inputDelay < recover) {
            await sleep(inputDelay)
          }
        } else {
          auto_reloading = true
          await KeyPressAndRelease(keyBinds['reload'], inputDelay)
          await sleep(1800)
          auto_reloading = false
          apw_start = apw_start_rate
          apw_counts = 0
        }
        break
      default:
        await sleep(1000 / 120)
        break
    }
    autokey_engine()
  }
  autokey_engine()

  ipcMain.on('chat_lefttop', () => {
    windows['chat'].setPosition(0, 0)
  })

  ipcMain.handle('loaded', async (_, window) => {
    if (windows[window].isLoaded) return { isDev }
    if (window == 'overlay') {
      windows[window].setAlwaysOnTop(true, 'screen-saver')
      windows[window].setIgnoreMouseEvents(true)
      initEngine()
      windows[window].focus()
    }
    if (window == 'chat') {
      windows[window].webContents.send('visible', true)
      windows[window].setIgnoreMouseEvents(true)
      await sleep(20)
    }
    if (window == 'main') {
      windows[window].webContents.send('keyBinds', keyBinds)
      windows[window].webContents.send('visible', true)
      if (username && steamID64 && gamePath && configPath) windows.main.webContents.send('steaminfo', { username, steamID64, gamePath, configPath, configInfo })
      // else windows.main.webContents.send('steaminfo', { error: 'steam not found' })

      windows[window].webContents.send('initSettings', {
        instantfire,
        instantfire_delay,
        inputDelay,
        chatinputdelay,
        rotate_delay,
        instant_chat,
        cinematic_mode,
        autokey_type,
        autokey_enabled,
        auto_arc_delay,
        auto_railgun_delay,
        auto_railgun_reload_delay,
        auto_eruptor_delay,
        apw_start_rate,
        mousestratagem_enabled,
        mousestratagem_with_console,
        mousestratagem_threshold,
        mousestratagem_delay
      })

      windows[window].show()
      await sleep(20)
      windows[window].focus()
    }
    windows[window].isLoaded = true
    return { isDev }
  })
}

autoUpdater.on('checking-for-update', () => {
  windows.main.webContents.send('checking-for-update', true)
});
autoUpdater.on('update-available', info => {
  windows.main.webContents.send('update-available', info)
});
autoUpdater.on('update-not-available', info => {
  windows.main.webContents.send('update-not-available', info)
});
autoUpdater.on('error', err => {
  windows.main.webContents.send('update-error', err)
});
autoUpdater.on('download-progress', progress => {
  windows.main.webContents.send('download-progress', progress)
})
let updateready = false
autoUpdater.on('update-downloaded', info => {
  updateready = true
  windows.main.webContents.send('update-downloaded', info)
})
ipcMain.handle('check_update', async () => {
  if (isDev) {
    windows.main.webContents.send('update-not-available', { version: '0.0.0' })
    return
  }
  autoUpdater.checkForUpdatesAndNotify(new Notification({
    icon: path.join(app.getAppPath(), 'icon.png'),
    title: 'Helldivers2 Helper', body: '새 업데이트가 있습니다!'
  }))
  return
})
ipcMain.on('update_install', () => {
  if (updateready) {
    autoUpdater.quitAndInstall()
  } else {
    // 앱 재시작 전에 정리 작업 수행
    try {
      app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
      app.exit(0)
    } catch (error) {
      console.error('재시작 중 오류 발생:', error)
      app.exit(1) // 오류 발생 시 종료 코드 1로 종료
    }
  }
})


app.whenReady().then(() => {
  protocol.handle('app', req => {
    return net.fetch('file://' + path.join(app.getAppPath(), req.url.slice('app://'.length)))
  })
  createMainWindow()
  autoUpdater.checkForUpdatesAndNotify(new Notification({
    icon: path.join(app.getAppPath(), 'icon.png'),
    title: 'Helldivers2 Helper', body: '새 업데이트가 있습니다!'
  }))
})
app.on('window-all-closed', () => {
  if (updateready) {
    autoUpdater.quitAndInstall()
  }
  else if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (windows.main) {
      if (windows.main.isMinimized()) windows.main.restore()
        windows.main.focus()
    }
  })
}

if (process.platform === 'win32')
{
  app.setAppUserModelId('Helldivers2 Helper')
}
