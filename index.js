import { MoveMouse, Key, keyboard, getForegroundWindowHWND, getWindowText, getWindowRect, KeyPress, KeyRelease, KeyPressAndRelease, MouseLeftClick, MouseRightClick, windowFocus, sendText, MouseLeftPress, MouseLeftRelease, MouseRightPress, MouseRightRelease, GetMousePosition, captureScreen } from './src/user32.js'
import { app, BrowserWindow, protocol, net, ipcMain, Notification, Menu, dialog, shell, desktopCapturer, screen, clipboard } from 'electron'
import pkg from 'electron-updater'
const { autoUpdater } = pkg
import path from 'path'
import { getCurrentSteamUser, getSteamID3, getSteamID64, getSteamInfo, getUserConfigPath, readUserConfig, getSteamProfileJoinLink } from './steam.js'
import fs from 'fs'
import { reset_recorder, start_recorder, pause_recorder, save_recorder, save_death_cam } from './record.js'
import { createRequire } from 'module';
import fsPromises from 'fs/promises';

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
const videopath = app.getPath('videos')

app.commandLine.appendSwitch('use-angle', 'd3d11')
app.commandLine.appendSwitch('disable-gpu', 'false')
app.commandLine.appendSwitch('enable-gpu')
app.commandLine.appendSwitch('enable-transparent-visuals')
app.commandLine.appendSwitch('enable-native-gpu-memory-buffers')
app.commandLine.appendSwitch('enable-usermedia-screen-capturing')


let keyBinds = {
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

  up: 'W',
  down: 'S',
  left: 'A',
  right: 'D',


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
}

const settingPath = path.join(userdatapath, 'user.settings.json')
let settings = {}
const saveSetting = () => {
  if (!fs.existsSync(settingPath)) fs.writeFileSync(settingPath, '{}')
  fs.writeFileSync(settingPath, JSON.stringify(settings))
}
const keysettingPath = path.join(userdatapath, 'user.settings.keybinds.json')
const saveKeySetting = () => {
  if (!fs.existsSync(keysettingPath)) fs.writeFileSync(keysettingPath, '{}')
  fs.writeFileSync(keysettingPath, JSON.stringify({
    reinforce: keyBinds.reinforce,
    rotatekey: keyBinds.rotatekey,
    rotatekey_reverse: keyBinds.rotatekey_reverse,
    rotate_cancel: keyBinds.rotate_cancel,
    HANGUL: keyBinds.HANGUL,
    mousestratagem: keyBinds.mousestratagem,
    autokey: keyBinds.autokey,
    autokey_sub: keyBinds.autokey_sub,
    autokey_sub2: keyBinds.autokey_sub2,
    record: keyBinds.record,
  }))
  windows['overlay'].webContents.send('keybinds', keyBinds)

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
let autokey_cancelable = true
let autokey_canceled = false
ipcMain.on('autokey_enabled', (_, value) => {
  autokey_enabled = value
  autokey_canceled = false
  settings.autokey_enabled = autokey_enabled
  saveSetting()
})
let autokey_with_goodarmor = false
ipcMain.on('autokey_with_goodarmor', (_, value) => {
  autokey_with_goodarmor = value
  settings.autokey_with_goodarmor = autokey_with_goodarmor
  saveSetting()
})
let autokey_type = ''
ipcMain.on('autokey_type', (_, value) => {
  autokey_type = value
  settings.autokey_type = autokey_type
  saveSetting()
})
let autokey_type_sub = ''
ipcMain.on('autokey_type_sub', (_, value) => {
  autokey_type_sub = value
  settings.autokey_type_sub = autokey_type_sub
  saveSetting()
})
let autokey_type_sub2 = ''
ipcMain.on('autokey_type_sub2', (_, value) => {
  autokey_type_sub2 = value
  settings.autokey_type_sub2 = autokey_type_sub2
  saveSetting()
})

let auto_arc_delay = 1100
ipcMain.on('auto_arc_delay', (_, value) => {
  auto_arc_delay = value
  settings.auto_arc_delay = auto_arc_delay
  saveSetting()
})

let auto_epoch_delay = 2900
ipcMain.on('auto_epoch_delay', (_, value) => {
  auto_epoch_delay = value
  settings.auto_epoch_delay = auto_epoch_delay
  saveSetting()
})
let auto_epoch_reload_delay = 4200
ipcMain.on('auto_epoch_reload_delay', (_, value) => {
  auto_epoch_reload_delay = value
  settings.auto_epoch_reload_delay = auto_epoch_reload_delay
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
let auto_eruptor_reload_delay = 2800
ipcMain.on('auto_eruptor_reload_delay', (_, value) => {
  auto_eruptor_reload_delay = value
  settings.auto_eruptor_reload_delay = auto_eruptor_reload_delay
  saveSetting()
})
let auto_crossbow_reload_delay = 3300
ipcMain.on('auto_crossbow_reload_delay', (_, value) => {
  auto_crossbow_reload_delay = value
  settings.auto_crossbow_reload_delay = auto_crossbow_reload_delay
  saveSetting()
})
let auto_purifier_reload_delay = 2500
ipcMain.on('auto_purifier_reload_delay', (_, value) => {
  auto_purifier_reload_delay = value
  settings.auto_purifier_reload_delay = auto_purifier_reload_delay
  saveSetting()
})
let apw_start_rate = 240
ipcMain.on('apw_start_rate', (_, value) => {
  apw_start_rate = parseInt(value) || 0
  settings.apw_start_rate = apw_start_rate
  saveSetting()
})
let heavy_start_rate = 50
ipcMain.on('heavy_start_rate', (_, value) => {
  heavy_start_rate = parseInt(value) || 0
  settings.heavy_start_rate = heavy_start_rate
  saveSetting()
})
let heavy_rpm = 750
ipcMain.on('heavy_rpm', (_, value) => {
  heavy_rpm = parseInt(value) || 0
  settings.heavy_rpm = heavy_rpm
  saveSetting()
})
let purifier_move_rate = 10
ipcMain.on('purifier_move_rate', (_, value) => {
  purifier_move_rate = parseInt(value) || 0
  settings.purifier_move_rate = purifier_move_rate
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


let autorecord = true
ipcMain.on('autorecord', (_, value) => {
  autorecord = value
  settings.autorecord = autorecord
  if (autorecord && gameRect) start_recorder(get_recorder_options())
  if (!autorecord) reset_recorder()
  saveSetting()
})
let record_duration = 30
ipcMain.on('record_duration', (_, value) => {
  record_duration = parseInt(value) || 0
  settings.record_duration = record_duration
  saveSetting()
  reset_recorder()
  start_recorder(get_recorder_options())
})
let record_framerate = 60
ipcMain.on('record_framerate', (_, value) => {
  record_framerate = parseInt(value) || 0
  settings.record_framerate = record_framerate
  saveSetting()
  pause_recorder()
  start_recorder(get_recorder_options())
})
let record_quality = 30
ipcMain.on('record_quality', (_, value) => {
  record_quality = parseInt(value) || 0
  settings.record_quality = record_quality
  saveSetting()
  pause_recorder()
  start_recorder(get_recorder_options())
})
let deathcam_enabled = true
ipcMain.on('deathcam_enabled', (_, value) => {
  deathcam_enabled = value
  settings.deathcam_enabled = deathcam_enabled
  saveSetting()
})
let deathcam_seconds = 5
ipcMain.on('deathcam_seconds', (_, value) => {
  deathcam_seconds = parseInt(value) || 0
  settings.deathcam_seconds = deathcam_seconds
  saveSetting()
})
let deathcam_delay = 2
ipcMain.on('deathcam_delay', (_, value) => {
  deathcam_delay = parseInt(value) || 0
  settings.deathcam_delay = deathcam_delay
  saveSetting()
})
let deathcam_preview = true
ipcMain.on('deathcam_preview', (_, value) => {
  deathcam_preview = value
  settings.deathcam_preview = deathcam_preview
  saveSetting()
})
let deathcam_max_counts = 10
ipcMain.on('deathcam_max_counts', (_, value) => {
  deathcam_max_counts = parseInt(value) || 0
  settings.deathcam_max_counts = deathcam_max_counts
  saveSetting()
})
let deathcam_size = 100
ipcMain.on('deathcam_size', (_, value) => {
  deathcam_size = parseInt(value) || 0

  settings.deathcam_size = deathcam_size
  saveSetting()
})
let deathcam_webp = false
ipcMain.on('deathcam_webp', (_, value) => {
  deathcam_webp = value
  settings.deathcam_webp = deathcam_webp
  saveSetting()
})



let displaylength = 0

let gameHWND
let focuswindow
let gameRect
let gameDisplay

let output_idx = 0
ipcMain.on('output_idx', (_, value) => {
  output_idx = parseInt(value) || 0
  settings.output_idx = output_idx
  reset_recorder()
  if (gameDisplay) gameDisplay.output_idx = output_idx
  saveSetting()
})

let recording = false

const tempDir = path.join(userdatapath, 'tempvids')
if (tempDir && fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

const finalDir = path.join(videopath, 'HELLDIVERS 2')
if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true })

const get_recorder_options = () => {
  return {
    ffmpegPath: path.join(isDev ? app.getAppPath() : path.join(process.resourcesPath, 'app.asar.unpacked'), 'ffmpeg', 'ffmpeg.exe'),
    ffmpegProbePath: path.join(isDev ? app.getAppPath() : path.join(process.resourcesPath, 'app.asar.unpacked'), 'ffmpeg', 'ffprobe.exe'),
    tempDir,
    finalDir,
    monitor: gameDisplay,
    rect: gameRect,
    framerate: record_framerate,
    quality: record_quality,
    duration: record_duration,
    deathcam_webp,
  }
}

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
  if (settings.autokey_with_goodarmor !== undefined) autokey_with_goodarmor = settings.autokey_with_goodarmor
  if (settings.autokey_type !== undefined) autokey_type = settings.autokey_type
  if (settings.autokey_type_sub !== undefined) autokey_type_sub = settings.autokey_type_sub
  if (settings.autokey_type_sub2 !== undefined) autokey_type_sub2 = settings.autokey_type_sub2
  if (settings.auto_arc_delay !== undefined) auto_arc_delay = settings.auto_arc_delay
  if (settings.auto_epoch_delay !== undefined) auto_epoch_delay = settings.auto_epoch_delay
  if (settings.auto_epoch_reload_delay !== undefined) auto_epoch_reload_delay = settings.auto_epoch_reload_delay
  if (settings.auto_railgun_delay !== undefined) auto_railgun_delay = settings.auto_railgun_delay
  if (settings.auto_railgun_reload_delay !== undefined) auto_railgun_reload_delay = settings.auto_railgun_reload_delay
  if (settings.auto_eruptor_delay !== undefined) auto_eruptor_delay = settings.auto_eruptor_delay
  if (settings.apw_start_rate !== undefined) apw_start_rate = settings.apw_start_rate
  if (settings.heavy_start_rate !== undefined) heavy_start_rate = settings.heavy_start_rate
  if (settings.heavy_rpm !== undefined) heavy_rpm = settings.heavy_rpm
  if (settings.purifier_move_rate !== undefined) purifier_move_rate = settings.purifier_move_rate
  if (settings.mousestratagem_enabled !== undefined) mousestratagem_enabled = settings.mousestratagem_enabled
  if (settings.mousestratagem_with_console !== undefined) mousestratagem_with_console = settings.mousestratagem_with_console
  if (settings.mousestratagem_threshold !== undefined) mousestratagem_threshold = settings.mousestratagem_threshold
  if (settings.mousestratagem_delay !== undefined) mousestratagem_delay = settings.mousestratagem_delay
  if (settings.autorecord !== undefined) autorecord = settings.autorecord
  if (settings.record_duration !== undefined) record_duration = settings.record_duration
  if (settings.record_framerate !== undefined) record_framerate = settings.record_framerate
  if (settings.record_quality !== undefined) record_quality = settings.record_quality
  if (settings.deathcam_enabled !== undefined) deathcam_enabled = settings.deathcam_enabled
  if (settings.deathcam_seconds !== undefined) deathcam_seconds = settings.deathcam_seconds
  if (settings.deathcam_delay !== undefined) deathcam_delay = settings.deathcam_delay
  if (settings.deathcam_max_counts !== undefined) deathcam_max_counts = settings.deathcam_max_counts
  if (settings.deathcam_preview !== undefined) deathcam_preview = settings.deathcam_preview
  if (settings.deathcam_size !== undefined) deathcam_size = settings.deathcam_size
  if (settings.deathcam_webp !== undefined) deathcam_webp = settings.deathcam_webp
  if (settings.output_idx !== undefined) output_idx = settings.output_idx
  if (settings.displaylength !== undefined) displaylength = settings.displaylength
}
if (fs.existsSync(keysettingPath)) {
  const keyBindsRead = JSON.parse(fs.readFileSync(keysettingPath, 'utf8'))
  if (keyBinds.reinforce) keyBinds['reinforce'] = keyBindsRead.reinforce
  if (keyBinds.rotatekey) keyBinds['rotatekey'] = keyBindsRead.rotatekey
  if (keyBinds.rotatekey_reverse) keyBinds['rotatekey_reverse'] = keyBindsRead.rotatekey_reverse
  if (keyBinds.rotate_cancel) keyBinds['rotate_cancel'] = keyBindsRead.rotate_cancel
  if (keyBinds.HANGUL) keyBinds['HANGUL'] = keyBindsRead.HANGUL
  if (keyBinds.mousestratagem) keyBinds['mousestratagem'] = keyBindsRead.mousestratagem
  if (keyBinds.autokey) keyBinds['autokey'] = keyBindsRead.autokey
  if (keyBinds.autokey_sub) keyBinds['autokey_sub'] = keyBindsRead.autokey_sub
  if (keyBinds.autokey_sub2) keyBinds['autokey_sub2'] = keyBindsRead.autokey_sub2
  if (keyBinds.record) keyBinds['record'] = keyBindsRead.record
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
    case 'NUMPAD *':
      reskey = 'MULTIPLY'
      break
    case 'NUMPAD /':
      reskey = 'DIVIDE'
      break
    case 'NUMPAD -':
      reskey = 'SUBTRACT'
      break
    case 'NUMPAD +':
      reskey = 'ADD'
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
let steamID3
let gamePath
let username
let configPath
let configInfo
setInterval(async () => {
  if (dynamic_interval_stopper) return
  if (!steamID3 || !gamePath || !username || !configPath) {
    try {
      steamID3 = await getSteamID3()
      gamePath = await getUserConfigPath(steamID3, gameId)
      username = await getCurrentSteamUser()
      configPath = await getUserConfigPath(steamID3, gameId)
    } catch (e) {
      windows.main.webContents.send('steaminfo', { error: e })
    }
  }
  try {
    const before = JSON.stringify(keyBinds)
    configInfo = await readUserConfig(steamID3, gameId, configPath)
    if (configInfo?.json) {
      const { json } = configInfo
      const { Stratagem, Avatar, Player, Misc } = json || {}
      if (Avatar?.Sprint) {
        const setting = Avatar.Sprint.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting?.input)
        if (newkey) keyBinds['sprint'] = newkey
      }
      if (Player?.OpenChat) {
        const setting = Player.OpenChat.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting?.input)
        if (newkey) keyBinds['chat'] = newkey
      }
      if (Avatar?.ChangeEquipmentContextSensitiveShort) {
        const setting = Avatar.ChangeEquipmentContextSensitiveShort.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting?.input)
        if (newkey) keyBinds['weapon_swap'] = newkey
      }
      if (Avatar?.ChangeEquipmentPrimary) {
        const setting = Avatar.ChangeEquipmentPrimary.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting?.input)
        if (newkey) keyBinds['weapon_1'] = newkey
      }
      if (Avatar?.ChangeEquipmentSecondary) {
        const setting = Avatar.ChangeEquipmentSecondary.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting?.input)
        if (newkey) keyBinds['weapon_2'] = newkey
      }
      if (Avatar?.ChangeEquipmentSupport) {
        const setting = Avatar.ChangeEquipmentTertiary.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting?.input)
        if (newkey) keyBinds['weapon_3'] = newkey
      }
      if (Avatar?.ChangeEquipmentGrenade) {
        const setting = Avatar.ChangeEquipmentGrenade.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting?.input)
        if (newkey) keyBinds['weapon_4'] = newkey
      }
      if (Avatar?.BackpackFunction) {
        const setting = Avatar.BackpackFunction.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting?.input)
        if (newkey) keyBinds['weapon_5'] = newkey
      }
      if (Avatar?.ChangeEquipmentQuickGrenade) {
        const setting = Avatar.ChangeEquipmentQuickGrenade.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting?.input)
        if (newkey) keyBinds['granade'] = newkey
      }
      if (Avatar?.QuickStim) {
        const setting = Avatar.QuickStim.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting?.input)
        if (newkey) keyBinds['heal'] = newkey
      }
      if (Avatar?.WeaponFunctionOpen) {
        const setting = Avatar.WeaponFunctionOpen.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting?.input)
        if (newkey) keyBinds['weapon_function'] = newkey
        weapon_function_key_type = setting?.trigger
      }
      if (Avatar?.Map) {
        const setting = Avatar.Map.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting?.input)
        if (newkey) keyBinds['map'] = newkey
        map_key_type = setting?.trigger
      }
      if (Misc?.ToggleHudVisibility) {
        const setting = Misc.ToggleHudVisibility.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting?.input)
        if (newkey) keyBinds['cinematic_mode'] = newkey
      }
      if (Avatar?.DropOpen) {
        const setting = Avatar.DropOpen.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting?.input)
        if (newkey) keyBinds['dropopen'] = newkey
        dropopen_key_type = setting?.trigger
      }
      if (Avatar?.Dodge) {
        const setting = Avatar.Dodge.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting?.input)
        if (newkey) keyBinds['dive'] = newkey
      }
      if (Avatar?.Reload) {
        const setting = Avatar.Reload.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting?.input)
        if (newkey) keyBinds['reload'] = newkey
      }
      if (Avatar?.MoveForward) {
        const setting = Avatar.MoveForward.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting?.input)
        if (newkey) keyBinds['move_forward'] = newkey
      }
      if (Avatar?.MoveBack) {
        const setting = Avatar.MoveBack.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting?.input)
        if (newkey) keyBinds['move_back'] = newkey
      }
      if (Avatar?.MoveLeft) {
        const setting = Avatar.MoveLeft.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting?.input)
        if (newkey) keyBinds['move_left'] = newkey
      }
      if (Avatar?.MoveRight) {
        const setting = Avatar.MoveRight.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting?.input)
        if (newkey) keyBinds['move_right'] = newkey
      }
      for (const [ key, value ] of Object.entries(Stratagem || {})) {
        const setting = value.find(e => e.device_type == 'Keyboard')
        const newkey = bindHelldivers2Key(setting?.input)
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
            if (setting?.trigger) stratagem_key_type = setting?.trigger
            break
        }
      }
    }
    if (before != JSON.stringify(keyBinds)) {
      windows.main.webContents.send('keyBinds', keyBinds)
      stratagemPending = false
      windows.main.webContents.send('steaminfo', { username, steamID3, gamePath, configPath, configInfo })
    }
  } catch (e) {
    // console.log(e)
    windows.main.webContents.send('steaminfo', { username, steamID3, gamePath, configPath, error: e })
  }
}, 2000)

const createMainWindow = () => {
  windows.main = new BrowserWindow({
    width: 1600,
    height: 1000,
    titleBarStyle: 'hidden',
    minWidth: 1600,
    minHeight: 1000,
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
    resizable: false,
    focusable: false
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
    resizable: false,
    type: 'toolbar'
  })
  windows.chat.on('page-title-updated', (evt) => {
    evt.preventDefault()
  })

  windows.record = new BrowserWindow({
    width: 1280,
    height: 900,
    titleBarStyle: 'hidden',
    title: "Helldivers2 Record",
    transparent: true,
    show: false,
    webPreferences: {
      preload: path.join(app.getAppPath(), '/preload.js'),
      backgroundThrottling: false,
      webSecurity: false
    },
    icon: path.join(app.getAppPath(), 'icon.png'),
    frame: false,
    alwaysOnTop: true,
    alwaysOnTopMonotonic: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false
  })

  windows.main.loadURL(isDev ? 'http://localhost:3000' : 'app://dist/index.html')
  windows.overlay.loadURL(isDev ? 'http://localhost:3000' : 'app://dist/index.html')
  windows.chat.loadURL(isDev ? 'http://localhost:3000' : 'app://dist/index.html')
  windows.record.loadURL(isDev ? 'http://localhost:3000' : 'app://dist/index.html')

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
    if (windows.main.isMaximized()) {
      windows.main.unmaximize()
    } else {
      windows.main.restore()
    }
  })
  ipcMain.on('close', (e, m) => {
    windows.main.close()
  })

  ipcMain.on('initRoute', () => {
    windows.main.webContents.send('initRoute', '/main')
    windows.overlay.webContents.send('initRoute', '/overlay')
    windows.chat.webContents.send('initRoute', '/chat')
    windows.record.webContents.send('initRoute', '/record')
  })

  ipcMain.on('stratagemsets', (_, array) => {
    stratagemsets = array
    windows.overlay.webContents.send('stratagemsets', stratagemsets)
  })

  ipcMain.on('open_config_path', (_, __) => {
    try {
      shell.openPath(configPath.replace('\\input_settings.config', ''))
    } catch (e) {
      // console.log(e)
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
      await sleep(1000 / 24)
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
    if (gameHWND) await windowFocus(gameHWND)
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
      await sleep(1000 / 30)
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
        await sleep(1000 / 30)
      }
    }
    mouse_stratagem_engine()
  }
  mouse_stratagem_engine()

  
  let keywatching = false
  ipcMain.on('key_watching', (_, target) => {
    keywatching = target
  })
  ipcMain.on('save_bindkeys', (_, { target, key }) => {
    keyBinds[target] = key
    saveKeySetting()
    keywatching = false
  })

  ipcMain.on('cancel_key', (_, __) => {
    keywatching = false
  })


  const initEngine = async () => {
    keyboard.on('EVERY', async ({ key, state }) => {
      if (!focuswindowIsGame() && keywatching) {
        if (key == 'LBUTTON') return
        if (!state) {
          // const pressingkeys = Object.entries(keyboard.status).filter(([key, state]) => state).map(([key]) => key)
        }
        if (state) {
          windows.main.webContents.send('key_watching', key)
        }
        return
      }

      if (focuswindow == 'Helldivers2 Chat') {
        if (state) {
          if (key == 'TAB' && (keyboard.status['LMENU'] || keyboard.status['RMENU'] || keyboard.status['MENU'] )) {
            windows.chat.webContents.send('chatInput', false)
          }
        }
      }
      if ((key == 'RBUTTON' || key == 'LBUTTON') && state) {
        try {
          if (pendingDuringChatKey) {
            windows.chat.webContents.send('closeChat')
            pendingDuringChatKey = false
          }
        } catch (e) {}
      }

      if (!focuswindowIsGame()) {
        // 컨트롤+C 키 입력 감지
        if (key === 'C' && state && keyboard.status['LCONTROL']) {
          handleSteamProtocol()
        }
        return
      }
      if (key == keyBinds['reload'] && state) {
        weapon_used[lastusedweapon] = 0
      }
      if (key == keyBinds['dive'] && state) {
        cannot_reload = true
        setTimeout(() => cannot_reload = false, 1500)
      }

      if (key == keyBinds['record'] && state && autorecord) {
        // if (gameDisplay.rotate) return
        if (recording) return
        await record_overlay_show(3000)
        windows.record.webContents.send('record_started', true)
        recording = true
        await sleep(inputDelay)
        const filepath = await save_recorder()
        recording = false
        await record_overlay_show(4000)
        if (filepath) {
          windows.record.webContents.send('record_saved', filepath)
        } else {
          windows.record.webContents.send('record_saved', null)
        }
        return
      }

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

      if (mousestratagem_enabled) {
        if (key == keyBinds['mousestratagem']) {
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
      }

      if (autokey_type) {
        if (key == keyBinds['autokey']) {
          // if (state && auto_reloading) return
          autokey_enabled = state
          autokey_canceled = false
          autokey_type_num = 0
          if ((autokey_type == 'railgun' || autokey_type == 'epoch') && !state && railgun_fired) {
            if (keyboard.status[keyBinds['fire']]) await inputFire(0, 'release')
            if (autokey_type == 'railgun') {
              await sleep(inputDelay)
              await KeyPressAndRelease(keyBinds['reload'], inputDelay)
            }
            railgun_fired = false
            if (autokey_type == 'epoch') {
              if (Date.now() - pressedAt > 1000) {
                weapon_used[3]++
              }
              if (weapon_used[3] >= 3 && !cannot_reload) {
                auto_reloading = true
                await KeyPressAndRelease(keyBinds['reload'], inputDelay)
                await sleep(auto_epoch_reload_delay)
                auto_reloading = false
              }
            }
          }
          if (!state && keyboard.status[keyBinds['fire']] && autokey_type != 'purifier_charge') {
            await inputFire(0, 'release')
          }
          return
        } else {
          switch (key) {
            case keyBinds['map']:
            case keyBinds['dropopen']:
            case keyBinds['chat']:
            case keyBinds['stratagem_console']:
              // autokey_enabled = false
              if (autokey_cancelable) autokey_canceled = true
              break
          }
        }
        // if (key == keyBinds['dive'] && state) autokey_enabled = false
      }
      if (autokey_type_sub) {
        if (key == keyBinds['autokey_sub']) {
          // if (state && auto_reloading) return
          autokey_enabled = state
          autokey_canceled = false
          autokey_type_num = 1
          if ((autokey_type_sub == 'railgun' || autokey_type_sub == 'epoch') && !state && railgun_fired) {
            if (keyboard.status[keyBinds['fire']]) await inputFire(0, 'release')
            if (autokey_type == 'railgun') {
              await sleep(inputDelay)
              await KeyPressAndRelease(keyBinds['reload'], inputDelay)
            }
            railgun_fired = false
            if (autokey_type == 'epoch') {
              if (Date.now() - pressedAt > 1000) {
                weapon_used[3]++
              }
              if (weapon_used[3] >= 3 && !cannot_reload) {
                auto_reloading = true
                await KeyPressAndRelease(keyBinds['reload'], inputDelay)
                await sleep(auto_epoch_reload_delay)
                auto_reloading = false
              }
            }
          }
          if (!state && keyboard.status[keyBinds['fire']] && autokey_type_sub != 'purifier_charge') {
            await inputFire(0, 'release')
          }
          return
        } else {
          switch (key) {
            case keyBinds['map']:
            case keyBinds['dropopen']:
            case keyBinds['chat']:
            case keyBinds['stratagem_console']:
              // autokey_enabled = false
              if (autokey_cancelable) autokey_canceled = true
              break
          }
        }
        // if (key == keyBinds['dive'] && state) autokey_enabled = false
      }
      if (autokey_type_sub2) {
        if (key == keyBinds['autokey_sub2']) {
          // if (state && auto_reloading) return
          autokey_enabled = state
          autokey_canceled = false
          autokey_type_num = 2
          if ((autokey_type_sub2 == 'railgun' || autokey_type_sub2 == 'epoch') && !state && railgun_fired) {
            if (keyboard.status[keyBinds['fire']]) await inputFire(0, 'release')
            if (autokey_type == 'railgun') {
              await sleep(inputDelay)
              await KeyPressAndRelease(keyBinds['reload'], inputDelay)
            }
            railgun_fired = false
            if (autokey_type == 'epoch') {
              if (Date.now() - pressedAt > 1000) {
                weapon_used[3]++
              }
              if (weapon_used[3] >= 3 && !cannot_reload) {
                auto_reloading = true
                await KeyPressAndRelease(keyBinds['reload'], inputDelay)
                await sleep(auto_epoch_reload_delay)
                auto_reloading = false
              }
            }
          }
          if (!state && keyboard.status[keyBinds['fire']] && autokey_type_sub2 != 'purifier_charge') {
            await inputFire(0, 'release')
          }
          return
        } else {
          switch (key) {
            case keyBinds['map']:
            case keyBinds['dropopen']:
            case keyBinds['chat']:
            case keyBinds['stratagem_console']:
              // autokey_enabled = false
              if (autokey_cancelable) autokey_canceled = true
              break
          }
        }
        // if (key == keyBinds['dive'] && state) autokey_enabled = false
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
        case keyBinds['autokey_sub']:
        case keyBinds['autokey_sub2']:
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

      if (!state) {
        switch (key) {
          case keyBinds['HANGUL']:
          // case 'RMENU':
          // case 'KANJI':
          // case 'NEXT':
          // case 'RCONTROL':
            if (stratagemPending && !instant_chat) {
              await KeyRelease(key)
              await KeyPressAndRelease('BACK')
              await windows.chat.setIgnoreMouseEvents(false)
              await windows.chat.focus()
              windows.chat.webContents.send('chatInput', true)
              // const chatHWND = windows.chat.getNativeWindowHandle()
              // await setIMEMode(chatHWND)
            }
            return
        }

        if (key == keyBinds['chat']) {
          if (pendingDuringChatKey) return
          if (!stratagemPending) {
            stratagemPending = true
            stratagemReady = false
            if (cinematic_mode && !map_opened) {
              await cinematic_input_queue_run()
              // await sleep(inputDelay)
              await KeyPressAndRelease(keyBinds['chat'])
            }
            if (instant_chat) {
              pendingDuringChatKey = true
              await KeyRelease(key)
              await KeyPressAndRelease('BACK')
              await windows.chat.setIgnoreMouseEvents(false)
              await windows.chat.focus()
              windows.chat.webContents.send('chatInput', true)
            }
          } else if (keyBinds['chat'] == 'RETURN') {
            if (cinematic_mode && !map_opened) await cinematic_input_queue_run()
            stratagemPending = false
            stratagemReady = false
          }
          return
        }
        if (key == 'RETURN') {
          if (pendingDuringChatKey) return
          if (stratagemPending) {
            stratagemPending = false
            if (cinematic_mode && !map_opened) {
              await sleep(inputDelay)
              await cinematic_input_queue_run()
            }
          }
          stratagemReady = false
          return
        }

        if (key == keyBinds['weapon_1'] ||
            key == keyBinds['weapon_2'] ||
            key == keyBinds['weapon_3'] ||
            key == keyBinds['weapon_4'] ||
            key == keyBinds['weapon_5'] ||
            key == keyBinds['granade'] ||
            key == keyBinds['heal']
        ) {
          if (key == keyBinds['weapon_1']) lastusedweapon = 1
          if (key == keyBinds['weapon_2']) lastusedweapon = 2
          if (key == keyBinds['weapon_3']) lastusedweapon = 3
          if (key == keyBinds['weapon_4']) lastusedweapon = 4
          stratagemReady = false
          return
        }
  
        if (key == keyBinds['escape']) {
          stratagemPending = false
          pendingDuringChatKey = false
          return
        }
  
        if (key == keyBinds['fire']) {
          stratagemPending = false
          if (stratagemReady) {
            stratagemReady.lastFire = Date.now()
            windows.overlay.webContents.send('stratagemFire', stratagemReady)
          }
          stratagemReady = false
          return
        }

        // if (key == keyBinds['resupply']) {
        //   if (stratagemRunning || stratagemPending) return
        //   await inputStratagem({
        //     name: 'Resupply',
        //     keys: ['down', 'down', 'up', 'right'],
        //     icon: '/stratagems/General Stratagems/Resupply.svg',
        //     cooldown: 1000 * 160,
        //     cooldown: 1000 * 15
        //   })
        // }
        if (key == keyBinds['reinforce']) {
          if (stratagemRunning || stratagemPending) return
          await inputStratagem({
            name: 'Reinforce',
            keys: ['up', 'down', 'right', 'left', 'up'],
            icon: '/stratagems/General Stratagems/Reinforce.svg',
          })
          return
        }
        if (key == keyBinds['stratagem_console'] && !stratagemRunning) {
          stratagemReady = false
          return
        }
      }

    })
  }

  const focuswindowIsGame = () => focuswindow == 'HELLDIVERS™ 2'
  const findRedPixel = async buffer => {
    const countsmap = {}
    let maxCount = 0
    let maxKey = null

    for (let i = 0; i < buffer.length; i += 4) {
      const b = buffer[i]
      const g = buffer[i + 1]
      const r = buffer[i + 2]

      if (r > 250 && g > 20 && g < 150 && b > 20 && b < 150) {
        const index = `${r}${g}${b}`
        const count = (countsmap[index] || 0) + 1
        countsmap[index] = count

        if (count > maxCount) {
          maxCount = count
          maxKey = index
        }
      }
    }

    return maxCount
  }
  let lastalivestate = true
  let record_overlay_hide_timer
  let redstime
  const record_overlay_show = async ms => {
    windows['record'].show()
    if (record_overlay_hide_timer) clearTimeout(record_overlay_hide_timer)
    record_overlay_hide_timer = setTimeout(() => {
      windows['record'].hide()
      windows['record'].webContents.send('deathcam', {})
    }, ms + 300)
    await sleep(300)
    return
  }
  const checkforegroundWindow = async () => {
    if (dynamic_interval_stopper) {
      await sleep(1000 / 6)
      checkforegroundWindow()
      return
    }
    try {
      const HWND = await getForegroundWindowHWND()
      const text = await getWindowText(HWND)
      if (focuswindow == 'HELLDIVERS™ 2' && text != 'HELLDIVERS™ 2') {
        try {
          getFolderSize(finalDir)
            .then(r => windows['main'].webContents.send('video_path_size', r))
        } catch (e) {}
      }
      focuswindow = text
      const rect = await getWindowRect(HWND)
      rect.x = Math.max(0, rect.x)
      rect.y = Math.max(0, rect.y)
      if (text == 'HELLDIVERS™ 2') {
        if (!windows['overlay'].isVisible() && stratagemsets.length) windows['overlay'].show()
        if (!windows['chat'].isVisible()) windows['chat'].show()

        gameHWND = HWND
        windows['overlay'].setAlwaysOnTop(true, 'screen-saver')
        windows['overlay'].setIgnoreMouseEvents(true)
        windows['overlay'].webContents.send('visible', true)
        windows['overlay'].webContents.send('cinematic_mode', cinematic_mode)
        if (autorecord) {
          windows['record'].setAlwaysOnTop(true, 'screen-saver')
          windows['record'].webContents.send('visible', true)
          windows['record'].setIgnoreMouseEvents(true)
        }

        if (JSON.stringify(gameRect) != JSON.stringify(rect)) {
          const gamemid = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
          // console.log(screen.getAllDisplays())
          const displays = screen.getAllDisplays().sort((a, b) => a.id - b.id)
          const currentDisplay = displays.findIndex(display => {
            const { x, y, width, height } = display.bounds
            return gamemid.x >= x && gamemid.x <= x + width && gamemid.y >= y && gamemid.y <= y + height
          })
          windows['main'].webContents.send('displaylength', displays.length)
          settings.displaylength = displays.length
          saveSetting()
          gameDisplay = {
            index: currentDisplay,
            output_idx: Math.min(output_idx, displays.length - 1),
            x: displays[currentDisplay].bounds.x,
            y: displays[currentDisplay].bounds.y,
            rotate: displays[currentDisplay].rotation,
            scaleFactor: displays[currentDisplay].scaleFactor,
            width: displays[currentDisplay].bounds.width,
            height: displays[currentDisplay].bounds.height
          }
          // console.log(displays, gameDisplay)

          windows['main'].webContents.send('game_display', gameDisplay)

          gameRect = rect
          await reset_recorder()
          windows['overlay'].setResizable(true)
          windows['overlay'].setSize(parseInt(rect.width / gameDisplay.scaleFactor), parseInt(rect.height / 5 / gameDisplay.scaleFactor))
          windows['overlay'].setResizable(false)


          const overlayX = rect.x
          const overlayY = rect.y + rect.height - parseInt(rect.height / 5)
          windows['overlay'].setPosition(parseInt(overlayX / gameDisplay.scaleFactor), parseInt(overlayY / gameDisplay.scaleFactor))

          const width = parseInt(rect.width / 100 * 16 * (deathcam_size / 50))
          const height = parseInt(rect.width / 100 * 9 * (deathcam_size / 50))
          const recordX = rect.x + rect.width - width - parseInt(rect.height / 6)
          const recordY = rect.y + parseInt(rect.height / 10)
          windows['record'].setResizable(true)
          windows['record'].setSize(parseInt(width / gameDisplay.scaleFactor), parseInt(height / gameDisplay.scaleFactor))
          windows['record'].setResizable(false)
          windows['record'].setPosition(parseInt(recordX / gameDisplay.scaleFactor), parseInt(recordY / gameDisplay.scaleFactor))

          windows['chat'].setResizable(true)
          windows['chat'].setSize(parseInt(rect.height / 3 / gameDisplay.scaleFactor), parseInt(40 / gameDisplay.scaleFactor))
          windows['chat'].setResizable(false)
          const chatX = rect.x + parseInt(rect.width - rect.height / 40 - rect.height / 3)
          const chatY = rect.y + parseInt(rect.height - rect.height / 13 - 40)
          windows['chat'].setPosition(parseInt(chatX / gameDisplay.scaleFactor), parseInt(chatY / gameDisplay.scaleFactor))
        }
        if (autorecord) {
          start_recorder(get_recorder_options())
        }
        
        // if (deathcam_enabled && autorecord && !gameDisplay.rotate) {
        if (deathcam_enabled && autorecord) {
          const startX = parseInt((rect.x + (rect.width / 2) - (rect.height / 5)))
          const startY = parseInt((rect.y + (rect.height / 2) - (rect.height / 16)))
          const centerWidth = parseInt(rect.height / 5 * 2)
          const centerHeight = parseInt(rect.height / 16 * 2)
          const centerbuffer = await captureScreen(0, startX, startY, centerWidth, centerHeight)
          const reds = await findRedPixel(centerbuffer)

          let rate = 5
          if (rect.height < 950) rate = 2
          // console.log(startX, startY, centerWidth, centerHeight, reds)
          
          if (reds > centerHeight * rate) {
            if (!redstime) redstime = Date.now()
            else if (Date.now() - redstime > 1000 || deathcam_delay < 1) {
              if (lastalivestate) {
                weapon_used[1] = (autokey_type == 'eruptor' || autokey_type_sub == 'eruptor' || autokey_type_sub2 == 'eruptor') ? 1 : 0
                if (deathcam_delay >= 1) await sleep(deathcam_delay * 1000 - 1000)
                // else await sleep(deathcam_delay * 1000)
                recording = true
                const deathcam = await save_death_cam(deathcam_seconds + deathcam_delay, deathcam_webp)
                recording = false
                redstime = null
                if (deathcam_preview && deathcam) {
                  await record_overlay_show(deathcam.length * 1000)
                  windows['record'].webContents.send('deathcam', deathcam)
                  const deathcam_filenames = {}
                  fs.readdirSync(path.join(finalDir, 'deathcam')).forEach(file => {
                    // 파일 이름에서 확장자 제거하고 'death_' 접두어 제거
                    if (!file.startsWith('death_')) return
                    const basename = path.basename(file, path.extname(file)).replace('death_', '')
                    if (!deathcam_filenames[basename]) deathcam_filenames[basename] = []
                    deathcam_filenames[basename].push(path.join(finalDir, 'deathcam', file))
                  })

                  // 날짜 기준으로 정렬 (최신순)
                  const sortedDates = Object.keys(deathcam_filenames).sort((a, b) => {
                    const dateA = new Date(a.split('-').slice(0, 3).join('-') + 'T' + a.split('-').slice(3).join(':'))
                    const dateB = new Date(b.split('-').slice(0, 3).join('-') + 'T' + b.split('-').slice(3).join(':'))
                    return dateB - dateA
                  })

                  // deathcam_max_counts 초과하는 오래된 파일들 삭제
                  if (sortedDates.length > deathcam_max_counts) {
                    const filesToDelete = sortedDates.slice(deathcam_max_counts)
                    filesToDelete.forEach(date => {
                      deathcam_filenames[date].forEach(filepath => {
                        try {
                          fs.unlinkSync(filepath)
                        } catch (e) {
                          console.log('Failed to delete:', filepath)
                        }
                      })
                    })
                  }
                }
              }
              lastalivestate = false
            }
          } else {
            lastalivestate = true
            redstime = null
          }
        }
      } else {
        if (autorecord) pause_recorder()
        windows['overlay'].webContents.send('visible', false)
      }
    } catch (e) {
      console.log(e)
    }
    await sleep(1000 / 6)
    checkforegroundWindow()
  }
  checkforegroundWindow()

  const enginerunning = () => {
    const isgame = focuswindowIsGame()
    if (!isgame) {
      autokey_enabled = false
      autokey_canceled = false
    }
    if (autokey_canceled) return false
    return autokey_enabled && (autokey_type || autokey_type_sub || autokey_type_sub2)
  }
  let lastusedweapon = 1
  const weapon_used = {
    1: (autokey_type == 'eruptor' || autokey_type_sub == 'eruptor' || autokey_type_sub2 == 'eruptor') ? 1 : 0,
    2: 1,
    3: ((autokey_type == 'epoch' || autokey_type_sub == 'epoch' || autokey_type_sub2 == 'epoch') || (autokey_type == 'crossbow3' || autokey_type_sub == 'crossbow3' || autokey_type_sub2 == 'crossbow3')) ? 0 : 1,
    4: 1,
    5: 1
  }
  const eunginesleep = async (ms) => {
    const now = Date.now()
    const end = now + ms
    while (Date.now() + inputDelay < end) {
      if (!enginerunning()) break
      await sleep(inputDelay)
    }
  }
  let cannot_reload = false
  let railgun_fired = false
  let apw_start = apw_start_rate
  let heavy_start = heavy_start_rate
  let heavy_firing = false
  let auto_reloading = false
  let autokey_type_num = 0
  let lastRoundTime = 0
  let pressedAt = 0
  const autokey_engine = async () => {
    if (!enginerunning()) {
      if (heavy_firing) {
        await inputFire(0, 'release')
        heavy_firing = false
      }
      await sleep(1000 / 30)
      heavy_start = heavy_start_rate
      apw_start = apw_start_rate
      autokey_engine()
      return
    }
    const target = autokey_type_num == 0 ? autokey_type : autokey_type_num == 1 ? autokey_type_sub : autokey_type_sub2
    switch (target) {
      case 'arc':
        if (lastusedweapon != 3) {
          await KeyPressAndRelease(keyBinds['weapon_3'], inputDelay)
          await sleep(800)
        }
        // console.time('arc')
        await inputFire(0, 'press')
        if (!enginerunning()) break
        await eunginesleep(auto_arc_delay)
        if (!enginerunning()) break
        await inputFire(0, 'release')
        await sleep(inputDelay)
        // console.timeEnd('arc')
        break
      case 'epoch':
        if (lastusedweapon != 3) {
          await KeyPressAndRelease(keyBinds['weapon_3'], inputDelay)
          await sleep(800)
        }
        if (!enginerunning()) break
        pressedAt = Date.now()
        await inputFire(0, 'press')
        railgun_fired = true
        if (!enginerunning()) break
        await eunginesleep(auto_epoch_delay)
        if (!enginerunning()) break
        await inputFire(0, 'release')
        if (!enginerunning()) break
        await sleep(inputDelay)
        if (!enginerunning()) break
        if (Date.now() - pressedAt > 1000 && railgun_fired) {
          weapon_used[3]++
        }
        railgun_fired = false
        if (weapon_used[3] >= 3 && !cannot_reload) {
          auto_reloading = true
          await KeyPressAndRelease(keyBinds['reload'], inputDelay)
          await sleep(auto_epoch_reload_delay)
          auto_reloading = false
        } else await sleep(inputDelay)
        break
      case 'railgun':
        if (lastusedweapon != 3) {
          await KeyPressAndRelease(keyBinds['weapon_3'], inputDelay)
          await sleep(800)
        }
        if (!enginerunning()) break
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
        if (!cannot_reload) {
          auto_reloading = true
          await KeyPressAndRelease(keyBinds['reload'], inputDelay)
          await sleep(auto_railgun_reload_delay)
          auto_reloading = false
        } else await sleep(inputDelay)
        break
      case 'eruptor':
        if (lastusedweapon != 1) {
          await KeyPressAndRelease(keyBinds['weapon_1'], inputDelay)
          await sleep(auto_eruptor_delay * 2) // 조정필요
          if (!enginerunning()) break
        }
        await inputFire(inputDelay * 2)
        weapon_used[1]++
        await sleep(inputDelay)
        // if (!enginerunning()) {
        //   await sleep(auto_eruptor_delay)
        //   break
        // }
        if (weapon_used[1] >= 5) {
          if (cannot_reload) {
            await sleep(inputDelay)
            break
          }
          auto_reloading = true
          await KeyPressAndRelease(keyBinds['reload'], inputDelay)
          await sleep(autokey_with_goodarmor ? 2250 : 2850)
          auto_reloading = false
        } else {
          await KeyPressAndRelease(keyBinds['weapon_swap'], inputDelay)
          await sleep(auto_eruptor_delay)
          await KeyPressAndRelease(keyBinds['weapon_swap'], inputDelay)
          await sleep(auto_eruptor_delay)
        }
        break
      case 'crossbow':
      case 'crossbow2':
      case 'crossbow3':
        if (lastusedweapon != 1 && target != 'crossbow3') {
          await KeyPressAndRelease(keyBinds['weapon_1'], inputDelay)
          await sleep(auto_eruptor_delay * 2) // 조정필요
          if (!enginerunning()) break
        }
        if (lastusedweapon != 3 && target == 'crossbow3') {
          await KeyPressAndRelease(keyBinds['weapon_3'], inputDelay)
          await sleep(auto_eruptor_delay * 2) // 조정필요
          if (!enginerunning()) break
        }
        await inputFire(inputDelay * 2)
        if (target == 'crossbow') weapon_used[1]++
        if (target == 'crossbow2') weapon_used[1]++
        if (target == 'crossbow3') weapon_used[3]++
        await sleep(inputDelay)
        // if (!enginerunning()) {
        //   await sleep(auto_eruptor_delay)
        //   break
        // }
        if ((target == 'crossbow' && weapon_used[1] >= 5) || (target == 'crossbow2' && weapon_used[1] >= 10) || (target == 'crossbow3' && weapon_used[3] >= 10)) {
          if (cannot_reload) {
            await sleep(inputDelay)
            break
          }
          auto_reloading = true
          await KeyPressAndRelease(keyBinds['reload'], inputDelay)
          if (target == 'crossbow') await sleep(autokey_with_goodarmor ? 2600 : 3400)
          if (target == 'crossbow2') await sleep(autokey_with_goodarmor ? 1900 : 2500)
          if (target == 'crossbow3') await sleep(3500)
          auto_reloading = false
        } else {
          if (cannot_reload) {
            while (cannot_reload) {
              await sleep(inputDelay)
            }
            break
          }
          await sleep(25)
          await KeyPressAndRelease(keyBinds['heal'], inputDelay)
          await sleep(25)
          autokey_cancelable = false
          await KeyPressAndRelease(keyBinds['map'], inputDelay)
          await sleep(25)
          autokey_cancelable = true
          if (map_key_type == 'Press' && !enginerunning()) {     
            await KeyPressAndRelease(keyBinds['map'], inputDelay)
            await sleep(25)
          }
          // await KeyPressAndRelease(keyBinds['weapon_swap'], inputDelay)
          // await sleep(auto_eruptor_delay)
          // await KeyPressAndRelease(keyBinds['weapon_swap'], inputDelay)
          // await sleep(auto_eruptor_delay)
        }
        break
        case 'purifier':
          if (lastusedweapon != 1) {
            await KeyPressAndRelease(keyBinds['weapon_1'], inputDelay)
            await sleep(auto_eruptor_delay * 2)
            if (!enginerunning()) break
          }
          const end = Date.now()
          let rounds = 1
          lastRoundTime = end
          let fireInterval = 60000 / 560  // 1000rpm = 60ms per shot
          
          while (rounds < (15 - weapon_used[1])) {
            const beforeFire = Date.now()
            await inputFire(15)
            await sleep(15)
            
            // 마지막 발사로부터 60ms 이상 지났을 때만 발사 카운트 증가
            const currentTime = Date.now()
            if (currentTime - lastRoundTime >= fireInterval) {
              rounds++
              lastRoundTime = beforeFire  // 실제 발사 시작 시점을 기준으로 시간 측정
              
              let move = Math.max(0, (purifier_move_rate - rounds) * 1.5)
              if (move) {
                if (keyboard.status[keyBinds['move_forward']] ||
                  keyboard.status[keyBinds['move_back']] ||
                  keyboard.status[keyBinds['move_left']] ||
                  keyboard.status[keyBinds['move_right']]
                ) {
                  move *= 2
                }
                MoveMouse(0, parseFloat(move))
              }
            }
            
            if (!enginerunning()) {
              break
            }
          }
          
          weapon_used[1] += rounds
          if (weapon_used[1] >= 15) {
            if (cannot_reload) {
              await sleep(inputDelay)
              break
            }
            auto_reloading = true
            await KeyPressAndRelease(keyBinds['reload'], inputDelay)
            await sleep(autokey_with_goodarmor ? 1850 : 2550)
            auto_reloading = false
            weapon_used[1] = 0
          }
          break
      case 'purifier_charge':
        if (lastusedweapon != 1) {
          await KeyPressAndRelease(keyBinds['weapon_1'], inputDelay)
          await sleep(auto_eruptor_delay * 2) // 조정필요
          if (!enginerunning()) break
        }
        while (weapon_used[1] < 15) {
          await inputFire(0, 'press')
          const end = Date.now() + 1100 - inputDelay
          while (Date.now() < end) {
            await sleep(inputDelay)
            if (!enginerunning() && end - Date.now() > 300) break
          }
          await inputFire(0, 'release')
          weapon_used[1]++
          await sleep(inputDelay * 2)
          if (!enginerunning()) {
            break
          }
        }
        if (weapon_used[1] >= 15) {
          if (cannot_reload) {
            await sleep(inputDelay)
            break
          }
          auto_reloading = true
          await KeyPressAndRelease(keyBinds['reload'], inputDelay)
          await sleep(autokey_with_goodarmor ? 1900 : 2550)
          auto_reloading = false
          weapon_used[1] = 0
        }
        break
      case 'apw':
        if (lastusedweapon != 3) {
          await KeyPressAndRelease(keyBinds['weapon_3'], inputDelay)
          await sleep(900)
          if (!enginerunning()) break
        }
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
        weapon_used[3]++
        if (weapon_used[3] < 7) {
          while (Date.now() < recover) {
            await sleep(inputDelay)
          }
        } else if (!cannot_reload) {
          auto_reloading = true
          await KeyPressAndRelease(keyBinds['reload'], inputDelay)
          await sleep(1800)
          auto_reloading = false
          apw_start = apw_start_rate
        } else await sleep(inputDelay)
        break
      case 'heavy':
        if (!heavy_firing) heavy_firing = Date.now()
        const rpmtick = 60000 / heavy_rpm
        const tick = (Date.now() - heavy_firing) / rpmtick
        heavy_firing = Date.now()
        if (!keyboard.status[keyBinds['fire']]) await inputFire(0, 'press')
        if (keyboard.status[keyBinds['move_forward']] ||
            keyboard.status[keyBinds['move_back']] ||
            keyboard.status[keyBinds['move_left']] ||
            keyboard.status[keyBinds['move_right']]
        ) {
          heavy_start *= 1 + (tick / 5)
        }
        if (heavy_start > 0.000000001) await MoveMouse(0, parseInt(heavy_start))
        heavy_start /= 1 + (tick)
        await sleep(inputDelay)
        break
      default:
        await sleep(1000 / 30)
        break
    }
    autokey_engine()
  }
  autokey_engine()

  ipcMain.on('chat_lefttop', () => {
    windows['chat'].setPosition(0, 0)
  })

  ipcMain.on('open_video_folder', () => {
    shell.openPath(finalDir)
  })
  ipcMain.on('clear_video_folder', () => {
    fs.rmSync(finalDir, { recursive: true, force: true })
    fs.mkdirSync(finalDir, { recursive: true })
    windows['main'].webContents.send('video_path_size', 0)
  })

  // 폴더의 총 용량을 비동기적으로 계산하는 함수
  const getFolderSize = async (folderPath) => {
    let totalSize = 0

    const calculateSize = async (dirPath) => {
      const files = await fsPromises.readdir(dirPath)

      const sizePromises = files.map(async (file) => {
        const filePath = path.join(dirPath, file)
        const stats = await fsPromises.stat(filePath)

        if (stats.isDirectory()) {
          await calculateSize(filePath) // 재귀적으로 하위 디렉토리 탐색
        } else {
          totalSize += stats.size // 파일 크기 합산
        }
      })

      await Promise.all(sizePromises)
    };

    await calculateSize(folderPath)
    return totalSize;
  }

  ipcMain.handle('loaded', async (_, window) => {
    if (windows[window].isLoaded) return { isDev }

    if (window == 'overlay') {
      windows[window].setAlwaysOnTop(true, 'screen-saver')
      windows[window].setIgnoreMouseEvents(true)
      windows['overlay'].webContents.send('keybinds', keyBinds)
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
      if (username && steamID3 && gamePath && configPath) windows.main.webContents.send('steaminfo', { username, steamID3, gamePath, configPath, configInfo })
      // else windows.main.webContents.send('steaminfo', { error: 'steam not found' })
      
      try {
        windows['main'].webContents.send('video_path_size', await getFolderSize(finalDir))
      } catch (e) {}

      windows[window].webContents.send('initSettings', {
        instantfire,
        instantfire_delay,
        inputDelay,
        chatinputdelay,
        rotate_delay,
        instant_chat,
        cinematic_mode,
        autokey_type,
        autokey_type_sub,
        autokey_type_sub2,
        autokey_enabled,
        autokey_with_goodarmor,
        auto_arc_delay,
        auto_epoch_delay,
        auto_epoch_reload_delay,
        auto_railgun_delay,
        auto_railgun_reload_delay,
        auto_eruptor_delay,
        apw_start_rate,
        heavy_start_rate,
        heavy_rpm,
        purifier_move_rate,
        mousestratagem_enabled,
        mousestratagem_with_console,
        mousestratagem_threshold,
        mousestratagem_delay,
        autorecord,
        record_duration,
        record_framerate,
        record_quality,
        deathcam_enabled,
        deathcam_seconds,
        deathcam_delay,
        deathcam_max_counts,
        deathcam_preview,
        deathcam_size,
        deathcam_webp,
        output_idx,
        displaylength,
        keyBinds
      })

      windows[window].show()
      await sleep(20)
      windows[window].focus()
    }
    if (window == 'record') {
      windows[window].webContents.send('visible', true)
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

const modPath = path.join(userdatapath, 'mods')
if (!fs.existsSync(modPath)) fs.mkdirSync(modPath, { recursive: true })
ipcMain.handle('open_modfile', async () => {
  const { promise, resolve, reject } = Promise.withResolvers()
  dialog.showOpenDialog(
    {
      title: "모드 파일 불러오기",
      filters: [{ name: '모드 압축 파일', extensions: ['zip', '7z', 'rar', 'tar', 'gz', 'bz2', 'xz', 'wim', 'cab', 'iso', 'arj', 'lzh', 'lha', 'chm', 'z', 'taz', 'cpio', 'rpm', 'deb', 'lzma', 'tgz', 'txz', 'tbz2', 'tlz'] }],
      properties: ['openFile', 'multiSelections']
    }
  ).then(({ filePaths }) => {
    const res = []
    for (const filePath of filePaths) {
      const filename = filePath.split('/').pop().split('\\').pop().replace(/\.[^/.]+$/, '')
      if (!res.find(e => e.path == filePath)) res.push({
        name: filename,
        path: filePath,
        exist: fs.existsSync(path.join(modPath, filename))
      })
    }
    resolve(res)
  }).catch(e => {
    reject(e)
  })
  return await promise
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

// 스팀 프로토콜 처리, 자동 입장 기능
const handleSteamProtocol = async () => {
  const currentContent = clipboard.readText()
  if (currentContent.startsWith('steam://')) {
    shell.openExternal(currentContent)
  }
}

// 게임 참여 링크 복사 기능
ipcMain.on('copy-game-invite', async () => {
  try {
    const steamID64 = await getSteamID64()
    if (!steamID64) {
      windows.main.webContents.send('copy-game-invite-result', { error: '스팀 ID를 찾을 수 없습니다.' })
      return
    }
    
    const lobbyID = await getSteamProfileJoinLink(steamID64)
    if (!lobbyID) {
      windows.main.webContents.send('copy-game-invite-result', { error: '게임 로비를 찾을 수 없습니다.' })
      return
    }
    
    const inviteLink = `steam://joinlobby/553850/${lobbyID}/${steamID64}`
    clipboard.writeText(inviteLink)
    windows.main.webContents.send('copy-game-invite-result', { success: true })
  } catch (error) {
    console.error('게임 참여 링크 복사 오류:', error.message)
    windows.main.webContents.send('copy-game-invite-result', { 
      error: error.message || '게임 참여 링크를 가져오는데 실패했습니다.' 
    })
  }
})
