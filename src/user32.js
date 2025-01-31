import { load, DataType, open, close, createPointer, unwrapPointer, arrayConstructor } from 'ffi-rs'

const user32Library = 'user32'
const user32Path = 'user32.dll'
const gdi32Library = 'gdi32'
const gdi32Path = 'gdi32.dll'
const kernel32Library = 'kernel32'
const kernel32Path = 'kernel32.dll'
const imm32Library = 'imm32'
const imm32Path = 'imm32.dll'

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

open({
  library: user32Library,
  path: user32Path
})
open({
  library: gdi32Library,
  path: gdi32Path
})
open({
  library: kernel32Library,
  path: kernel32Path
})
open({
  library: imm32Library,
  path: imm32Path
})

export const getForegroundWindowHWND = async () => {
  const foregroundWindowHWND = await load({
    library: user32Library,
    runInNewThread: true,
    funcName: 'GetForegroundWindow',
    retType: DataType.I32,
    paramsType: [],
    paramsValue: [],
  })
  return foregroundWindowHWND >>> 0
}
export const getWindowText = async HWND => {
  const stringBuffer = Buffer.alloc(8192 * 2)
  await load({
    library: user32Library,
    runInNewThread: true,
    funcName: 'GetWindowTextW',
    retType: DataType.I32,
    paramsType: [DataType.I32, DataType.U8Array, DataType.I32],
    paramsValue: [HWND || await getForegroundWindowHWND(), stringBuffer, 8192],
  })
  return stringBuffer.toString('utf-16le').replace(/\0/g, '')
}
export const getWindowRect = async HWND => {
  const rect = Buffer.alloc(16)
  await load({
    library: user32Library,
    runInNewThread: true,
    funcName: 'GetWindowRect',
    retType: DataType.I32,
    paramsType: [DataType.I32, DataType.U8Array],
    paramsValue: [HWND || await getForegroundWindowHWND(), rect],
  })
  return {
    x: rect.readInt32LE(0),
    y: rect.readInt32LE(4),
    width: rect.readInt32LE(8) - rect.readInt32LE(0),
    height: rect.readInt32LE(12) - rect.readInt32LE(4),
  }
}

export class VirtualCodeKey {
  0x01 = 'LBUTTON'; // 왼쪽 마우스 단추
  0x02 = 'RBUTTON'; // 마우스 오른쪽 단추
  0x03 = 'CANCEL'; // Ctrl+Break 처리
  0x04 = 'MBUTTON'; // 마우스 가운데 단추
  0x05 = 'XBUTTON1'; // X1 마우스 단추
  0x06 = 'XBUTTON2'; // X2 마우스 단추
  // 0x07 예약됨
  0x08 = 'BACK'; // 백스페이스 키
  0x09 = 'TAB'; // Tab 키
  // 0x0A-0B 예약됨
  0x0C = 'CLEAR'; // 지우기 키
  0x0D = 'RETURN'; // Enter 키
  // 0x0E-0F 할당되지 않음
  0x10 = 'SHIFT'; // Shift 키
  0x11 = 'CONTROL'; // Ctrl 키
  0x12 = 'MENU'; // Alt 키
  0x13 = 'PAUSE'; // Pause 키
  0x14 = 'CAPITAL'; // Caps Lock 키
  0x15 = 'KANA'; // IME 가나 모드
  0x15 = 'HANGUL'; // IME 한글 모드
  0x16 = 'IME_ON'; // IME 켜기
  0x17 = 'JUNJA'; // IME 전자 모드
  0x18 = 'FINAL'; // IME 최종 모드
  0x19 = 'HANJA'; // IME 한자 모드
  0x19 = 'KANJI'; // IME 간지 모드
  0x1A = 'IME_OFF'; // IME 끄기
  0x1B = 'ESCAPE'; // Esc 키
  0x1C = 'CONVERT'; // IME 변환
  0x1D = 'NONCONVERT'; // IME 변환 안 함
  0x1E = 'ACCEPT'; // IME 수락
  0x1F = 'MODECHANGE'; // IME 모드 변경 요청
  0x20 = 'SPACE'; // 스페이스바
  0x21 = 'PRIOR'; // Page Up 키
  0x22 = 'NEXT'; // Page Down 키
  0x23 = 'END'; // End 키
  0x24 = 'HOME'; // Home 키
  0x25 = 'LEFT'; // 왼쪽 화살표 키
  0x26 = 'UP'; // 위쪽 화살표 키
  0x27 = 'RIGHT'; // 오른쪽 화살표 키
  0x28 = 'DOWN'; // 아래쪽 화살표 키
  0x29 = 'SELECT'; // 선택 키
  0x2A = 'PRINT'; // 인쇄 키
  0x2B = 'EXECUTE'; // 실행 키
  0x2C = 'SNAPSHOT'; // Print Screen 키
  0x2D = 'INSERT'; // Ins 키
  0x2E = 'DELETE'; // DEL 키
  0x2F = 'HELP'; // 도움말 키
  0x30 = '0'; // 0 키
  0x31 = '1'; // 1 키
  0x32 = '2'; // 2 키
  0x33 = '3'; // 3 키
  0x34 = '4'; // 4 키
  0x35 = '5'; // 5 키
  0x36 = '6'; // 6 키
  0x37 = '7'; // 7 키
  0x38 = '8'; // 8 키
  0x39 = '9'; // 9 키
  // 0x3A-40 Undefined
  0x41 = 'A'; // A 키
  0x42 = 'B'; // B 키
  0x43 = 'C'; // C 키
  0x44 = 'D'; // D 키
  0x45 = 'E'; // E 키
  0x46 = 'F'; // F 키
  0x47 = 'G'; // G 키
  0x48 = 'H'; // H 키
  0x49 = 'I'; // I 키
  0x4A = 'J'; // J 키
  0x4B = 'K'; // K 키
  0x4C = 'L'; // L 키
  0x4D = 'M'; // M 키
  0x4E = 'N'; // N 키
  0x4F = 'O'; // O 키
  0x50 = 'P'; // P 키
  0x51 = 'Q'; // Q 키
  0x52 = 'R'; // R 키
  0x53 = 'S'; // S 키
  0x54 = 'T'; // T 키
  0x55 = 'U'; // U 키
  0x56 = 'V'; // V 키
  0x57 = 'W'; // W 키
  0x58 = 'X'; // X 키
  0x59 = 'Y'; // Y 키
  0x5A = 'Z'; // Z 키
  0x5B = 'LWIN'; // 왼쪽 Windows 키
  0x5C = 'RWIN'; // 오른쪽 Windows 키
  0x5D = 'APPS'; // 애플리케이션 키
  // 0x5E 예약됨
  0x5F = 'SLEEP'; // 컴퓨터 절전 키
  0x60 = 'NUMPAD0'; // 숫자 키패드 0 키
  0x61 = 'NUMPAD1'; // 숫자 키패드 1 키
  0x62 = 'NUMPAD2'; // 숫자 키패드 2 키
  0x63 = 'NUMPAD3'; // 숫자 키패드 3 키
  0x64 = 'NUMPAD4'; // 숫자 키패드 4 키
  0x65 = 'NUMPAD5'; // 숫자 키패드 5 키
  0x66 = 'NUMPAD6'; // 숫자 키패드 6 키
  0x67 = 'NUMPAD7'; // 숫자 키패드 7 키
  0x68 = 'NUMPAD8'; // 숫자 키패드 8 키
  0x69 = 'NUMPAD9'; // 숫자 키패드 9 키
  0x6A = 'MULTIPLY'; // 곱하기 키
  0x6B = 'ADD'; // 더하기 키
  0x6C = 'SEPARATOR'; // 구분 기호 키
  0x6D = 'SUBTRACT'; // 빼기 키
  0x6E = 'DECIMAL'; // 소수점 키
  0x6F = 'DIVIDE'; // 나누기 키
  0x70 = 'F1'; // F1 키
  0x71 = 'F2'; // F2 키
  0x72 = 'F3'; // F3 키
  0x73 = 'F4'; // F4 키
  0x74 = 'F5'; // F5 키
  0x75 = 'F6'; // F6 키
  0x76 = 'F7'; // F7 키
  0x77 = 'F8'; // F8 키
  0x78 = 'F9'; // F9 키
  0x79 = 'F10'; // F10 키
  0x7A = 'F11'; // F11 키
  0x7B = 'F12'; // F12 키
  0x7C = 'F13'; // F13 키
  0x7D = 'F14'; // F14 키
  0x7E = 'F15'; // F15 키
  0x7F = 'F16'; // F16 키
  0x80 = 'F17'; // F17 키
  0x81 = 'F18'; // F18 키
  0x82 = 'F19'; // F19 키
  0x83 = 'F20'; // F20 키
  0x84 = 'F21'; // F21 키
  0x85 = 'F22'; // F22 키
  0x86 = 'F23'; // F23 키
  0x87 = 'F24'; // F24 키
  // 0x88-8F 예약됨
  0x90 = 'NUMLOCK'; // Num Lock 키
  0x91 = 'SCROLL'; // Scroll Lock 키
  // 0x92-96 OEM 관련
  // 0x97-9F 할당되지 않음
  0xA0 = 'LSHIFT'; // 왼쪽 Shift 키
  0xA1 = 'RSHIFT'; // 오른쪽 Shift 키
  0xA2 = 'LCONTROL'; // 왼쪽 Ctrl 키
  0xA3 = 'RCONTROL'; // 오른쪽 Ctrl 키
  0xA4 = 'LMENU'; // 왼쪽 Alt 키
  0xA5 = 'RMENU'; // 오른쪽 Alt 키
  0xA6 = 'BROWSER_BACK'; // 브라우저 뒤로 키
  0xA7 = 'BROWSER_FORWARD'; // 브라우저 앞으로 키
  0xA8 = 'BROWSER_REFRESH'; // 브라우저 새로 고침 키
  0xA9 = 'BROWSER_STOP'; // 브라우저 중지 키
  0xAA = 'BROWSER_SEARCH'; // 브라우저 검색 키
  0xAB = 'BROWSER_FAVORITES'; // 브라우저 즐겨찾기 키
  0xAC = 'BROWSER_HOME'; // 브라우저 시작 및 홈 키
  0xAD = 'VOLUME_MUTE'; // 볼륨 음소거 키
  0xAE = 'VOLUME_DOWN'; // 볼륨 다운 키
  0xAF = 'VOLUME_UP'; // 볼륨 업 키
  0xB0 = 'MEDIA_NEXT_TRACK'; // 다음 트랙 키
  0xB1 = 'MEDIA_PREV_TRACK'; // 이전 트랙 키
  0xB2 = 'MEDIA_STOP'; // 미디어 중지 키
  0xB3 = 'MEDIA_PLAY_PAUSE'; // 미디어 재생/일시 중지 키
  0xB4 = 'LAUNCH_MAIL'; // 시작 메일 키
  0xB5 = 'LAUNCH_MEDIA_SELECT'; // 미디어 키 선택
  0xB6 = 'LAUNCH_APP1'; // 애플리케이션 1 키 시작
  0xB7 = 'LAUNCH_APP2'; // 애플리케이션 2 키 시작
  // 0xB8-B9 예약됨
  0xBA = 'OEM_1'; // 기타 문자에 사용됩니다. 키보드에 따라 달라질 수 있습니다. 미국 표준 키보드의 ;: 경우 키
  0xBB = 'OEM_PLUS'; // 모든 국가/지역의 + 경우 키
  0xBC = 'OEM_COMMA'; // 모든 국가/지역의 , 경우 키
  0xBD = 'OEM_MINUS'; // 모든 국가/지역의 - 경우 키
  0xBE = 'OEM_PERIOD'; // 모든 국가/지역의 . 경우 키
  0xBF = 'OEM_2'; // 기타 문자에 사용됩니다. 키보드에 따라 달라질 수 있습니다. 미국 표준 키보드의 /? 경우 키
  0xC0 = 'OEM_3'; // 기타 문자에 사용됩니다. 키보드에 따라 달라질 수 있습니다. 미국 표준 키보드의 `~ 경우 키
  // 0xC1-DA 예약됨
  0xDB = 'OEM_4'; // 기타 문자에 사용됩니다. 키보드에 따라 달라질 수 있습니다. 미국 표준 키보드의 [{ 경우 키
  0xDC = 'OEM_5'; // 기타 문자에 사용됩니다. 키보드에 따라 달라질 수 있습니다. 미국 표준 키보드의 \\| 경우 키
  0xDD = 'OEM_6'; // 기타 문자에 사용됩니다. 키보드에 따라 달라질 수 있습니다. 미국 표준 키보드의 ]} 경우 키
  0xDE = 'OEM_7'; // 기타 문자에 사용됩니다. 키보드에 따라 달라질 수 있습니다. 미국 표준 키보드의 '" 경우 키
  0xDF = 'OEM_8'; // 기타 문자에 사용됩니다. 키보드에 따라 달라질 수 있습니다.
  // 0xE0 예약됨
  // 0xE1 OEM 관련
  0xE2 = 'OEM_102'; // 미국 표준 키보드의 <> 키 또는 미국 외 지역 102키 키보드의 \\| 키
  // 0xE3-E4 OEM 관련
  0xE5 = 'PROCESSKEY'; // IME PROCESS 키
  // 0xE6 OEM 관련
  0xE7 = 'PACKET'; // 유니코드 문자를 키 입력인 것처럼 전달할 때 사용합니다. PACKET 키는 키보드가 아닌 입력 방법에 사용되는 32비트 가상 키 값의 하위 단어입니다. 자세한 내용은 KEYBDINPUT, SendInput, WM_KEYDOWN 및 WM_KEYUP의 설명 섹션을 참조하세요.
  // 0xE8 할당되지 않음
  // 0xE9-F5 OEM 관련
  0xF6 = 'ATTN'; // Attn 키
  0xF7 = 'CRSEL'; // CrSel 키
  0xF8 = 'EXSEL'; // ExSel 키
  0xF9 = 'EREOF'; // EOF 지우기 키
  0xFA = 'PLAY'; // 재생 키
  0xFB = 'ZOOM'; // 확대/축소 키
  0xFC = 'NONAME'; // 예약됨
  0xFD = 'PA1'; // PA1 키
  0xFE = 'OEM_CLEAR'; // 지우기 키
}

export class KeyScanCode {
  LBUTTON = 0x00
  RBUTTON = 0x00
  CANCEL = 0x46
  MBUTTON = 0x00
  XBUTTON1 = 0x00
  XBUTTON2 = 0x00
  BACK = 0x0E
  TAB = 0x0F
  CLEAR = 0x4C
  RETURN = 0x1C
  SHIFT = 0x2A
  CONTROL = 0x1D
  MENU = 0x38
  PAUSE = 0x00
  CAPITAL = 0x3A
  HANGUL = 0x72
  IME_ON = 0x00
  JUNJA = 0x00
  FINAL = 0x00
  KANJI = 0x1D
  IME_OFF = 0x00
  ESCAPE = 0x01
  CONVERT = 0x00
  NONCONVERT = 0x00
  ACCEPT = 0x00
  MODECHANGE = 0x00
  SPACE = 0x39
  PRIOR = 0x49
  NEXT = 0x51
  END = 0x4F
  HOME = 0x47
  LEFT = 0xE04B
  UP = 0xE048
  RIGHT = 0xE04D
  DOWN = 0xE050
  SELECT = 0x00
  PRINT = 0x00
  EXECUTE = 0x00
  SNAPSHOT = 0x54
  INSERT = 0x52
  DELETE = 0x53
  HELP = 0x62
  0 = 0x0B
  1 = 0x02
  2 = 0x03
  3 = 0x04
  4 = 0x05
  5 = 0x06
  6 = 0x07
  7 = 0x08
  8 = 0x09
  9 = 0x0A
  A = 0x1E
  B = 0x30
  C = 0x2E
  D = 0x20
  E = 0x12
  F = 0x21
  G = 0x22
  H = 0x23
  I = 0x17
  J = 0x24
  K = 0x25
  L = 0x26
  M = 0x32
  N = 0x31
  O = 0x18
  P = 0x19
  Q = 0x10
  R = 0x13
  S = 0x1F
  T = 0x14
  U = 0x16
  V = 0x2F
  W = 0x11
  X = 0x2D
  Y = 0x15
  Z = 0x2C
  LWIN = 0x5B
  RWIN = 0x5C
  APPS = 0x5D
  SLEEP = 0x5F
  NUMPAD0 = 0x52
  NUMPAD1 = 0x4F
  NUMPAD2 = 0x50
  NUMPAD3 = 0x51
  NUMPAD4 = 0x4B
  NUMPAD5 = 0x4C
  NUMPAD6 = 0x4D
  NUMPAD7 = 0x47
  NUMPAD8 = 0x48
  NUMPAD9 = 0x49
  MULTIPLY = 0x37
  ADD = 0x4E
  SEPARATOR = 0x00
  SUBTRACT = 0x4A
  DECIMAL = 0x53
  DIVIDE = 0x35
  F1 = 0x3B
  F2 = 0x3C
  F3 = 0x3D
  F4 = 0x3E
  F5 = 0x3F
  F6 = 0x40
  F7 = 0x41
  F8 = 0x42
  F9 = 0x43
  F10 = 0x44
  F11 = 0x57
  F12 = 0x58
  F13 = 0x64
  F14 = 0x65
  F15 = 0x66
  F16 = 0x67
  F17 = 0x68
  F18 = 0x69
  F19 = 0x6A
  F20 = 0x6B
  F21 = 0x6C
  F22 = 0x6D
  F23 = 0x6E
  F24 = 0x76
  NUMLOCK = 0x45
  SCROLL = 0x46
  LSHIFT = 0x2A
  RSHIFT = 0x36
  LCONTROL = 0x1D
  RCONTROL = 0x00
  LMENU = 0x38
  RMENU = 0x00
  BROWSER_BACK = 0x6A
  BROWSER_FORWARD = 0x69
  BROWSER_REFRESH = 0x67
  BROWSER_STOP = 0x68
  BROWSER_SEARCH = 0x65
  BROWSER_FAVORITES = 0x66
  BROWSER_HOME = 0x32
  VOLUME_MUTE = 0x20
  VOLUME_DOWN = 0x2E
  VOLUME_UP = 0x30
  MEDIA_NEXT_TRACK = 0x19
  MEDIA_PREV_TRACK = 0x10
  MEDIA_STOP = 0x24
  MEDIA_PLAY_PAUSE = 0x22
  LAUNCH_MAIL = 0x6C
  LAUNCH_MEDIA_SELECT = 0x6D
  LAUNCH_APP1 = 0x6B
  LAUNCH_APP2 = 0x21
  OEM_1 = 0x27
  OEM_PLUS = 0x0D
  OEM_COMMA = 0x33
  OEM_MINUS = 0x0C
  OEM_PERIOD = 0x34
  OEM_2 = 0x35
  OEM_3 = 0x29
  OEM_4 = 0x1A
  OEM_5 = 0x2B
  OEM_6 = 0x1B
  OEM_7 = 0x28
  OEM_8 = 0x00
  OEM_102 = 0x56
  PROCESSKEY = 0x00
  PACKET = 0x00
  ATTN = 0x00
  CRSEL = 0x00
  EXSEL = 0x00
  EREOF = 0x5D
  PLAY = 0x00
  ZOOM = 0x61
  NONAME = 0x00
  PA1 = 0x00
  OEM_CLEAR = 0x00
}
export const Key = new KeyScanCode()
export const VirtualKey = new VirtualCodeKey()

export const sendText = async (text, ms = 5) => {
  if (!text) return

  // 각 문자를 하나씩 처리
  for (const char of text) {
    const unicodeValue = char.charCodeAt(0)
    
    await load({
      library: user32Library,
      funcName: 'SendInput',
      retType: DataType.I32,
      paramsType: [DataType.I32, DataType.External, DataType.I32],
      paramsValue: [
        1,
        unwrapPointer(createPointer({
          paramsType: [{
            type: DataType.I32,
            "???": DataType.I32,
            wVk: DataType.I16,
            wScan: DataType.I16,
            dwFlags: DataType.I32,
            time: DataType.I32,
            dwExtraInfo: DataType.I64
          }],
          paramsValue: [{
            type: 1,
            "???": 0,
            wVk: 0,
            wScan: unicodeValue,
            dwFlags: 0x0004,  // KEYEVENTF_UNICODE
            time: 0,
            dwExtraInfo: 0
          }]
        }))[0],
        40
      ]
    })
    
    await sleep(ms) // 각 문자 입력 사이에 약간의 딜레이 추가
  }
}

export const KeyPress = async key => {
  const keyCode = Key[key]
  let dwFlags = 8
  switch (key) {
    case 'UP':
    case 'DOWN':
    case 'LEFT':
    case 'RIGHT':
      dwFlags = 8 | 1
      break
  }
  load({
    library: user32Library,
    funcName: 'SendInput',
    retType: DataType.I32,  // Correct return type
    paramsType: [DataType.I32, DataType.External, DataType.I32],
    paramsValue: [
      1,
      unwrapPointer(createPointer({
        paramsType: [{
            type: DataType.I32,
            "???": DataType.I32,
            wVk: DataType.I16,
            wScan: DataType.I16,
            dwFlags: DataType.I32,
            time: DataType.I32,
            dwExtraInfo: DataType.I64
        }],
        paramsValue: [{
          type: 1,
          "???": 0,
          wVk: 0,
          wScan: keyCode,
          dwFlags,
          time: 0,
          dwExtraInfo: 0
        }]
      }))[0],
      40
    ]
  })
}
export const KeyRelease = async key => {
  const keyCode = Key[key]
  let dwFlags = 8 | 2
  switch (key) {
    case 'UP':
    case 'DOWN':
    case 'LEFT':
    case 'RIGHT':
      dwFlags = 8 | 2 | 1
      break
  }
  load({
    library: user32Library,
    funcName: 'SendInput',
    retType: DataType.I32,  // Correct return type
    paramsType: [DataType.I32, DataType.External, DataType.I32],
    paramsValue: [
      1,
      unwrapPointer(createPointer({
        paramsType: [{
            type: DataType.I32,
            "???": DataType.I32,
            wVk: DataType.I16,
            wScan: DataType.I16,
            dwFlags: DataType.I32,
            time: DataType.I32,
            dwExtraInfo: DataType.I64
        }],
        paramsValue: [{
          type: 1,
          "???": 0,
          wVk: 0,
          wScan: keyCode,
          dwFlags,
          time: 0,
          dwExtraInfo: 0
        }]
      }))[0],
      40
    ]
  })
}
export const KeyPressAndRelease = async (key, ms = 5, HWND) => {
  if (HWND) {
    await load({
      library: user32Library,
      funcName: 'SetForegroundWindow',
      retType: DataType.I32,
      paramsType: [DataType.I32],
      paramsValue: [HWND]
    })
    
    await load({
      library: user32Library,
      funcName: 'SetActiveWindow',
      retType: DataType.I32,
      paramsType: [DataType.I32],
      paramsValue: [HWND]
    })
  }
  
  await KeyPress(key)
  await sleep(ms)
  await KeyRelease(key)
}

const handlers = {}
export const keyboard = {
  status: {},
  on: (key, handler) => {
    if (!handlers[key]) handlers[key] = new Set()
    handlers[key].add(handler)
  },
  off: (key, handler) => {
    if (!handlers[key]) return
    handlers[key].delete(handler)
  },
  emit: (key, state) => {
    if (!handlers[key]) return
    for (const handler of handlers[key]) handler(state)
  }
}
setInterval(() => {
  for (const key in VirtualKey) {
    const keystate = load({
      library: user32Library,
      funcName: 'GetAsyncKeyState',
      retType: DataType.I16,
      paramsType: [DataType.I32],
      paramsValue: [parseInt(key)]
    })
    const state = keystate & 0x8000
    if (keyboard.status[VirtualKey[key]] !== undefined && keyboard.status[VirtualKey[key]] !== !!state) {
      // console.log(VirtualKey[key], !!state ? 'press' : 'release')
      keyboard.emit(VirtualKey[key], !!state)
      keyboard.emit('EVERY', { key: VirtualKey[key], state: !!state })
    }
    keyboard.emit('EVERY_ALL', { key: VirtualKey[key], state: !!state })
    // if (state) console.log(VirtualKey[key])
    keyboard.status[VirtualKey[key]] = !!state
  }
}, 1000 / 120)

export const MouseLeftPress = async () => {
  // 마우스 왼쪽 버튼 누르기
  await load({
    library: user32Library,
    funcName: 'SendInput',
    retType: DataType.I32,
    paramsType: [DataType.I32, DataType.External, DataType.I32],
    paramsValue: [
      1,
      unwrapPointer(createPointer({
        paramsType: [{
          type: DataType.I32,
          "???": DataType.I32,
          dx: DataType.I32,
          dy: DataType.I32,
          mouseData: DataType.I32,
          dwFlags: DataType.I32,
          time: DataType.I32,
          dwExtraInfo: DataType.I64
        }],
        paramsValue: [{
          type: 0, // 마우스 이벤트
          "???": 0,
          dx: 0,
          dy: 0,
          mouseData: 0,
          dwFlags: 2, // MOUSEEVENTF_LEFTDOWN
          time: 0,
          dwExtraInfo: 0
        }]
      }))[0],
      40
    ]
  })
}
export const MouseLeftRelease = async () => {
  await load({
    library: user32Library,
    funcName: 'SendInput',
    retType: DataType.I32,
    paramsType: [DataType.I32, DataType.External, DataType.I32],
    paramsValue: [
      1,
      unwrapPointer(createPointer({
        paramsType: [{
          type: DataType.I32,
          "???": DataType.I32,
          dx: DataType.I32,
          dy: DataType.I32,
          mouseData: DataType.I32,
          dwFlags: DataType.I32,
          time: DataType.I32,
          dwExtraInfo: DataType.I64
        }],
        paramsValue: [{
          type: 0, // 마우스 이벤트
          "???": 0,
          dx: 0,
          dy: 0,
          mouseData: 0,
          dwFlags: 4, // MOUSEEVENTF_LEFTUP
          time: 0,
          dwExtraInfo: 0
        }]
      }))[0],
      40
    ]
  })
}
export const MouseLeftClick = async (ms = 5) => {
  await MouseLeftPress()
  await sleep(ms)
  await MouseLeftRelease()
}

export const MouseRightPress = async () => {
  // 마우스 왼쪽 버튼 누르기
  await load({
    library: user32Library,
    funcName: 'SendInput',
    retType: DataType.I32,
    paramsType: [DataType.I32, DataType.External, DataType.I32],
    paramsValue: [
      1,
      unwrapPointer(createPointer({
        paramsType: [{
          type: DataType.I32,
          "???": DataType.I32,
          dx: DataType.I32,
          dy: DataType.I32,
          mouseData: DataType.I32,
          dwFlags: DataType.I32,
          time: DataType.I32,
          dwExtraInfo: DataType.I64
        }],
        paramsValue: [{
          type: 0, // 마우스 이벤트
          "???": 0,
          dx: 0,
          dy: 0,
          mouseData: 0,
          dwFlags: 8, // MOUSEEVENTF_RIGHTDOWN
          time: 0,
          dwExtraInfo: 0
        }]
      }))[0],
      40
    ]
  })
}
export const MouseRightRelease = async () => {
  await load({
    library: user32Library,
    funcName: 'SendInput',
    retType: DataType.I32,
    paramsType: [DataType.I32, DataType.External, DataType.I32],
    paramsValue: [
      1,
      unwrapPointer(createPointer({
        paramsType: [{
          type: DataType.I32,
          "???": DataType.I32,
          dx: DataType.I32,
          dy: DataType.I32,
          mouseData: DataType.I32,
          dwFlags: DataType.I32,
          time: DataType.I32,
          dwExtraInfo: DataType.I64
        }],
        paramsValue: [{
          type: 0, // 마우스 이벤트
          "???": 0,
          dx: 0,
          dy: 0,
          mouseData: 0,
          dwFlags: 16, // MOUSEEVENTF_RIGHTUP
          time: 0,
          dwExtraInfo: 0
        }]
      }))[0],
      40
    ]
  })
}
export const MouseRightClick = async (ms = 5) => {
  await MouseRightPress()
  await sleep(ms)
  await MouseRightRelease()
}

export const MoveMouseTo = async (x, y) => {
  await load({
    library: user32Library,
    funcName: 'SetCursorPos',
    retType: DataType.I32,
    paramsType: [DataType.I32, DataType.I32],
    paramsValue: [x, y]
  })
}

export const GetMousePosition = async () => {
  const buffer = Buffer.alloc(8)
  await load({
    library: user32Library,
    funcName: 'GetCursorPos',
    retType: DataType.I32,
    paramsType: [DataType.U8Array],
    paramsValue: [buffer]
  })
  const x = buffer.subarray(0, 4).readInt32LE()
  const y = buffer.subarray(4, 8).readInt32LE()
  return { x, y }
}


export const getPixel = (HWND = 0, x, y) => {
  const hdcScreen = load({
    library: 'user32',
    funcName: 'GetDC',
    retType: DataType.I32,
    paramsType: [DataType.I32],
    paramsValue: [HWND]
  })
  const pixel = load({
    library: 'gdi32',
    funcName: 'GetPixel',
    retType: DataType.I32,
    paramsType: [DataType.I32, DataType.I32, DataType.I32],
    paramsValue: [hdcScreen, x, y]
  })
  return {
    r: (pixel >> 16) & 0xFF,
    g: (pixel >> 8) & 0xFF,
    b: pixel & 0xFF
  }
}

export const captureScreen = async (HWND = 0, x = 0, y = 0, width = 0, height = 0) => {
  // const handle = await load({
  //   library: user32Library,
  //   runInNewThread: true,
  //   funcName: 'GetForegroundWindow',
  //   retType: DataType.I32,
  //   paramsType: [],
  //   paramsValue: [],
  // })
  const hdcWindow = await load({
    library: 'user32',
    funcName: 'GetDC',
    retType: DataType.U64,
    paramsType: [DataType.I32],
    paramsValue: [HWND]
  }) >>> 0
  const rectToCapture = { x, y, width, height }
  const hdcMemDC = await load({
    library: gdi32Library,
    funcName: "CreateCompatibleDC",
    retType: DataType.I32,
    paramsType: [DataType.I32],
    paramsValue: [hdcWindow]
  }) >>> 0
  const hbmScreen = await load({
    library: gdi32Library,
    funcName: "CreateCompatibleBitmap",
    retType: DataType.I32,
    paramsType: [DataType.I32, DataType.I32, DataType.I32],
    paramsValue: [hdcWindow, rectToCapture.width, rectToCapture.height]
  }) >>> 0
  const hPrevDC = await load({
    library: gdi32Library,
    funcName: "SelectObject",
    retType: DataType.I32,
    paramsType: [DataType.I32, DataType.I32],
    paramsValue: [hdcMemDC, hbmScreen]
  }) >>> 0
  
  const bitBlt_result = await load({
    library: gdi32Library,
    funcName: "BitBlt",
    retType: DataType.Boolean,
    paramsType: [
        DataType.I32, DataType.I32, DataType.I32, DataType.I32, DataType.I32,
        DataType.I32, DataType.I32, DataType.I32, DataType.I32
    ],
    paramsValue: [hdcMemDC, 0, 0, rectToCapture.width, rectToCapture.height, hdcWindow, rectToCapture.x, rectToCapture.y, 0xCC0020]
  })
  const pixelWnd = await load({
    library: gdi32Library,
    funcName: "GetPixel",
    retType: DataType.I32,
    paramsType: [
        DataType.I32, DataType.I32, DataType.I32
    ],
    paramsValue: [hdcWindow, 0, 0]
  })
  const pixelMem = await load({
    library: gdi32Library,
    funcName: "GetPixel",
    retType: DataType.I32,
    paramsType: [
        DataType.I32, DataType.I32, DataType.I32
    ],
    paramsValue: [hdcMemDC, 0, 0]
  })
  const getObject_result = await load({
    library: gdi32Library,
    funcName: "GetObjectA",
    retType: DataType.I32,
    paramsType: [
        DataType.I32, DataType.I32, DataType.External
    ],
    paramsValue: [hbmScreen, 32, unwrapPointer(createPointer({
      paramsType: [{
        bmType: DataType.I32,
        bmWidth: DataType.I32,
        bmHeight: DataType.I32,
        bmWidthBytes: DataType.I32,
        bmPlanes: DataType.I16,
        bmBitsPixel: DataType.I16,
        bmBits: DataType.I64
      }],
      paramsValue: [{
        "bmType": 0,
        "bmWidth": rectToCapture.width,
        "bmHeight": rectToCapture.height,
        "bmWidthBytes": rectToCapture.width * 4,
        "bmPlanes": 1,
        "bmBitsPixel": 32,
        "bmBits": 0
      }]
    }))[0]]
  })
  const bitsPerRow = ((rectToCapture.width * 32 + 31) / 32) * 4;
  const dwBmpSize = bitsPerRow * rectToCapture.height;
  const lpBitmap = Buffer.alloc(dwBmpSize);
  
  const getDIBitsRes = await load({
    library: gdi32Library,
    funcName: "GetDIBits",
    retType: DataType.I32,
    paramsType: [
        DataType.I32, DataType.I32, DataType.I32, DataType.I32, DataType.U8Array, DataType.External, DataType.I32
    ],
    paramsValue: [hdcWindow, hbmScreen, 0, rectToCapture.height, lpBitmap, unwrapPointer(createPointer({
      paramsType: [{
        biSize: DataType.I32,
        biWidth: DataType.I32,
        biHeight: DataType.I32,
        biPlanes: DataType.I16,
        biBitCount: DataType.I16,
        biCompression: DataType.I32,
        biSizeImage: DataType.I32,
        biXPelsPerMeter: DataType.I32,
        biYPelsPerMeter: DataType.I32,
        biClrUsed: DataType.I32,
        biClrImportant: DataType.I32
      }],
      paramsValue: [{
        biSize: 40,      // Size of BITMAPINFOHEADER
        biWidth: rectToCapture.width,
        biHeight: -rectToCapture.height,  // Negative for top-down DIB
        biPlanes: 1,
        biBitCount: 32,  // 24-bit RGB
        biCompression: 0,
        biSizeImage: 0,
        biXPelsPerMeter: 0,
        biYPelsPerMeter: 0,
        biClrUsed: 0,
        biClrImportant: 0
      }]
    }))[0], 0]
  })
  
  load({
    library: gdi32Library,
    funcName: "DeleteObject",
    retType: DataType.Boolean,
    paramsType: [DataType.I32],
    paramsValue: [hbmScreen]
  })
  load({
    library: gdi32Library,
    funcName: "DeleteObject",
    retType: DataType.Boolean,
    paramsType: [DataType.I32],
    paramsValue: [hdcMemDC]
  })
  load({
    library: user32Library,
    funcName: "ReleaseDC",
    retType: DataType.I32,
    paramsType: [DataType.I32, DataType.I32],
    paramsValue: [HWND, hdcWindow]
  })

  return lpBitmap
}

export const windowFocus = async (HWND) => {
  await load({
    library: user32Library,
    funcName: 'SetForegroundWindow',
    retType: DataType.I32,
    paramsType: [DataType.I32],
    paramsValue: [HWND]
  })
  await load({
    library: user32Library,
    funcName: 'SetActiveWindow',
    retType: DataType.I32,
    paramsType: [DataType.I32],
    paramsValue: [HWND]
  })
}

export const setIMEMode = async (HWND) => {
  const IMC = await load({
    library: imm32Library,
    funcName: 'ImmGetContext',
    retType: DataType.I32,
    paramsType: [DataType.I32],
    paramsValue: [HWND]
  })

  await load({
    library: imm32Library,
    funcName: 'ImmSetConversionStatus',
    retType: DataType.I32,
    paramsType: [DataType.I32, DataType.I32, DataType.I32],
    paramsValue: [IMC, 0x0001, 0x0001]
  })

  await load({
    library: imm32Library,
    funcName: 'ImmReleaseContext',
    retType: DataType.I32,
    paramsType: [DataType.I32, DataType.I32],
    paramsValue: [HWND, IMC]
  })
}
