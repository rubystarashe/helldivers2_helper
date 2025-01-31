import { Key, keyboard, getForegroundWindowHWND, getWindowText, getWindowRect, KeyPress, KeyRelease, KeyPressAndRelease, MouseLeftClick, MouseRightClick, windowFocus, sendText } from './src/user32.js'
import { app, BrowserWindow, protocol, net, ipcMain, Notification, Menu, dialog, shell } from 'electron'
import pkg from 'electron-updater'
const { autoUpdater } = pkg
import path from 'path'
import { getSteamInfo } from './steam.js'

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


let keyBinds = {
  rotatekey: 'T',
  rotatekey_reverse: 'H',
  rotate_cancel: 'RBUTTON',

  chat: 'RETURN',
  escape: 'ESCAPE',
  fire: 'LBUTTON',
  sprint: 'LSHIFT',
  dive: 'LMENU',

  stratagem_console: 'LCONTROL',

  weapon_1: '1',
  weapon_2: '2',
  weapon_3: '3',
  weapon_4: '4',
  weapon_5: '5',
  granade: 'G',
  heal: 'V',

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

  HANGUL: 'HANGUL'
}
let instantfire = true
ipcMain.on('instantfire', (_, value) => {
  instantfire = value
})
let instantfire_delay = 1000
ipcMain.on('instantfire_delay', (_, value) => {
  instantfire_delay = parseInt(value) || 0
})
let inputDelay = 30
ipcMain.on('inputDelay', (_, value) => {
  inputDelay = parseInt(value) || 0
})
let chatinputdelay = 5
ipcMain.on('chatinputdelay', (_, value) => {
  chatinputdelay = parseInt(value) || 0
})
let rotate_delay = 300
ipcMain.on('rotate_delay', (_, value) => {
  rotate_delay = parseInt(value) || 0
})
let instant_chat = true
ipcMain.on('instant_chat', (_, value) => {
  instant_chat = value
})
let cinematic_mode = false
ipcMain.on('cinematic_mode', (_, value) => {
  cinematic_mode = value
  try {
    windows.overlay.webContents.send('cinematic_mode', cinematic_mode)
  } catch (e) {}
})

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

setInterval(async () => {
  try {
    const before = JSON.stringify(keyBinds)
    const { configInfo, steamID64, gamePath } = await getSteamInfo()
    if (configInfo?.json) {
      const { json } = configInfo
      const { Stratagem, Avatar, Player, Misc } = json
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
      for (const [ key, value ] of Object.entries(Stratagem)) {
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
    }
  } catch (e) {}
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
      preload: path.join(app.getAppPath(), '/preload.js')
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

  const stratagemQueue = []
  let queueRunning = false
  const stratagemQueueRun = async () => {
    if (queueRunning) return
    queueRunning = true
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
    queueRunning = false
  }

  const inputStratagem = async (stratagem, delay = inputDelay) => {
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
      await KeyPress(keyBinds['stratagem_console'])
      await sleep(delay)
      for (const key of stratagem.keys) {
        await sleep(delay)
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
          switch (keyBinds['fire']) {
            case 'LBUTTON':
              await MouseLeftClick(delay)
              break
            case 'RBUTTON':
              await MouseRightClick(delay)
              break
            default:
              await KeyPressAndRelease(keyBinds['fire'], delay)
              break
          }
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
    pendingDuringChatKey = false
    chatInputting = false
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
          if (weapon_function_key_type == 'LongPress') {
            if (long_delay_listeners[keyBinds['weapon_function']]) return
            long_delay_listeners[keyBinds['weapon_function']] = setTimeout(async () => {
              long_delay_listeners[keyBinds['weapon_function']] = null
              await cinematic_input_queue_run()
            }, 300)
          } else {
            cancelable_acting = true
          }
          return
        }
        if (key == keyBinds['weapon_function'] && !state) {
          if (stratagem_opened || map_opened) return
          if (weapon_function_key_type == 'LongPress') {
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

        if (key == keyBinds['map'] && state) {
          if (stratagem_opened) return
          if (map_key_type == 'Hold') {
            if (!stratagem_opened) await cinematic_input_queue_run()
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
          await cinematic_input_queue_run()
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

        if (key == keyBinds['stratagem_console'] && state) {
          if (map_opened) return
          if (stratagem_key_type == 'Hold') {
            await cinematic_input_queue_run()
            stratagem_opened = true
          }
          return
        }
        if (key == keyBinds['stratagem_console'] && !state) {
          if (map_opened) return
          await cinematic_input_queue_run()
          if (stratagem_key_type == 'Hold') {
            cancelable_acting = false
            stratagem_opened = false
          }
          else {
            cancelable_acting = !cancelable_acting
            stratagem_opened = !stratagem_opened
          }
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

        if (key == keyBinds['chat'] && !state) {
          if (pendingDuringChatKey) return
          if (keyBinds['chat'] != 'RETURN' && !cinematic_state) return
          pendingDuringChatKey = true
          if (!map_opened) await cinematic_input_queue_run()
          await sleep(inputDelay)
          await KeyPressAndRelease(keyBinds['chat'])
          stratagemPending = true
          stratagemReady = false
          await sleep(inputDelay)
          pendingDuringChatKey = false
          return
        }
        if (keyBinds['chat'] != 'RETURN' && key == 'RETURN' && !state) {
          if (pendingDuringChatKey) return
          if (!map_opened) await cinematic_input_queue_run()
          stratagemPending = false
          stratagemReady = false
          return
        }
      }

      if (!state) {
        switch (key) {
          case keyBinds['HANGUL']:
          case 'RMENU':
          case 'KANJI':
          case 'NEXT':
          case 'RCONTROL':
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
            if (instant_chat) {
              await KeyRelease(key)
              await KeyPressAndRelease('BACK')
              await windows.chat.setIgnoreMouseEvents(false)
              await windows.chat.focus()
              windows.chat.webContents.send('chatInput', true)
            }
          } else if (keyBinds['chat'] == 'RETURN') {
            stratagemPending = false
            stratagemReady = false
          }
          return
        }
        if (key == 'RETURN') {
          if (stratagemPending) stratagemPending = false
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
          stratagemReady = false
          return
        }
  
        if (key == keyBinds['escape']) {
          stratagemPending = false
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
        windows['overlay'].setSize(rect.width, rect.height)
        windows['overlay'].setPosition(rect.x, rect.y)
        windows['overlay'].webContents.send('visible', true)
        windows['overlay'].webContents.send('cinematic_mode', cinematic_mode)

        if (!windows['chat'].inited) {
          windows['chat'].setSize(parseInt(rect.height / 3), 40)
          windows['chat'].setPosition(parseInt(rect.width - rect.height / 40 - rect.height / 3), parseInt(rect.height - rect.height / 13 - 40))
          windows['chat'].inited = true
        }
      } else {
        windows['overlay'].webContents.send('visible', false)
      }
    } catch (e) {}
  }, 1000 / 6)

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
