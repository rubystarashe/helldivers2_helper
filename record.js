import { exec, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

let recorder
let tempDir
let workdir
let deathcamDir
let finalDir
let finalDeathcamDir
let ffmpegPath
let ffmpegProbePath

const execPromise = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stderr)
      } else {
        resolve(stdout)
      }
    })
  })
}

export const reset_recorder = async () => {
  if (!recorder) return
  recorder.kill()
  recorder = null
  // tempDir 폴더 삭제
  if (tempDir && fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
  // 임시파일 다삭제
  // 레코더 종료
}

export const pause_recorder = () => {
  if (!recorder) return
  recorder.kill()
  recorder = null
}

export const start_recorder = (options = {}) => {
  if (recorder) return

  const { monitor, framerate, rect, quality, duration } = options

  if (!monitor || !rect || !framerate || !quality || !duration) return
  tempDir = options.tempDir
  workdir = path.join(tempDir, 'work')
  deathcamDir = path.join(tempDir, 'deathcam')
  finalDir = options.finalDir
  finalDeathcamDir = path.join(finalDir, 'deathcam')
  ffmpegPath = options.ffmpegPath
  ffmpegProbePath = options.ffmpegProbePath

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }

  const monitor_rect = {
    x: Math.max(0, monitor.x - rect.x),
    y: Math.max(0, monitor.y - rect.y),
    width: Math.min(monitor.width, rect.width),
    height: Math.min(monitor.height, rect.height)
  }

  const args = [
    '-f', 'lavfi',             // lavfi 입력 사용
    '-i', `ddagrab=output_idx=${monitor.index}:framerate=${framerate}:video_size=${monitor_rect.width}x${monitor_rect.height}:offset_x=${monitor_rect.x}:offset_y=${monitor_rect.y}`,           // ddagrab 필터 (Desktop Duplication API 사용)
    
    '-c:v', 'h264_nvenc',      // NVIDIA 하드웨어 인코더 사용
    '-cq:v', String(quality),             // 품질(quantizer) 옵션
    '-g', String(framerate),
    '-sc_threshold', '0',

    '-f', 'segment',           // segment muxer 사용
    '-segment_time', '1',      // 1초 단위로 분할
    '-segment_wrap', String(duration), // 최대 세그먼트 수(예: duration이 10이면 최신 10초)
    '-reset_timestamps', '1',  // 각 세그먼트의 타임스탬프 초기화
    path.join(tempDir, 'segment_%03d.mp4')
  ]

  recorder = spawn(ffmpegPath, args, { windowsHide: true })
}

export const save_recorder = async () => {
  if (!recorder) return

  const { promise, resolve, reject } = Promise.withResolvers()

  // workdir로 파일을 이동하지 않고 tempDir에서 직접 처리
  const files = fs.readdirSync(tempDir)
    .filter(file => file.startsWith("segment_") && file.endsWith(".mp4"))
    .map(file => ({ path: path.join(tempDir, file), name: file }))

  if (files.length === 0) return

  files.sort((a, b) => fs.statSync(a.path).mtimeMs - fs.statSync(b.path).mtimeMs)

  if (!fs.existsSync(workdir)) {
    fs.mkdirSync(workdir, { recursive: true })
  }

  // Promise.all을 사용하여 병렬로 ffprobe 실행
  const validFiles = await Promise.all(files.map(async (file) => new Promise(async (resolve, reject) => {
    const dest = path.join(workdir, file.name)
    fs.copyFile(file.path, dest, async (err) => {
      if (err) {
        return resolve(null)
      } else {
        try {
          const probeCmd = `"${ffmpegProbePath}" -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${dest}"`
          await execPromise(probeCmd)
          return resolve(dest)
        } catch (error) {
          return resolve(null)
        }
      }
    })
  }))).then(results => results.filter(file => file !== null))

  if (validFiles.length === 0) return

  const fileListPath = path.join(tempDir, 'filelist.txt')
  const fileListContent = validFiles.map(f => `file '${f.replace(/'/g, "'\\''")}'`).join('\n')
  fs.writeFileSync(fileListPath, fileListContent)

  // GMT 시간으로 현재 날짜와 시간을 포맷하여 파일 이름 생성
  const now = new Date()
  const gmtDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  const formattedDate = gmtDate.toISOString().replace(/T/, '-').replace(/:/g, '-').split('.')[0]
  if (!fs.existsSync(finalDir)) {
    fs.mkdirSync(finalDir, { recursive: true })
  }
  const finalFile = path.join(finalDir, `${formattedDate}.mp4`)

  const concatCmd = `"${ffmpegPath}" -f concat -safe 0 -i "${fileListPath}" -c copy "${finalFile}"`
  const process = exec(concatCmd, (error, stdout, stderr) => {
    if (error) {
      fs.rmSync(workdir, { recursive: true, force: true })
      process.kill()
      resolve(null)
    } else {
      fs.rmSync(workdir, { recursive: true, force: true })
      process.kill()
      resolve({ path: finalFile, length: validFiles.length })
    }
  })

  return await promise
}

export const save_death_cam = async (seconds) => {
  if (!recorder) return

  const { promise, resolve, reject } = Promise.withResolvers()

  if (!fs.existsSync(deathcamDir)) {
    fs.mkdirSync(deathcamDir, { recursive: true })
  }

  const files = fs.readdirSync(tempDir)
    .filter(file => file.startsWith("segment_") && file.endsWith(".mp4"))
    .map(file => path.join(tempDir, file))

  if (files.length === 0) return

  files.sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs)

  // Promise.all을 사용하여 병렬로 ffprobe 실행
  const validFiles = await Promise.all(files.slice().reverse().map(async (file) => {
    try {
      const probeCmd = `"${ffmpegProbePath}" -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${file}"`
      await execPromise(probeCmd)
      return file
    } catch (error) {
      return null
    }
  })).then(results => results.filter(file => file !== null).slice(0, seconds))

  if (validFiles.length === 0) return
  validFiles.reverse()

  const fileListPath = path.join(deathcamDir, 'filelist.txt')
  const fileListContent = validFiles.map(f => `file '${f.replace(/'/g, "'\\''")}'`).join('\n')
  fs.writeFileSync(fileListPath, fileListContent)

  // GMT 시간으로 현재 날짜와 시간을 포맷하여 파일 이름 생성
  const now = new Date()
  const gmtDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  const formattedDate = gmtDate.toISOString().replace(/T/, '-').replace(/:/g, '-').split('.')[0]
  if (!fs.existsSync(finalDeathcamDir)) {
    fs.mkdirSync(finalDeathcamDir, { recursive: true })
  }
  const finalFile = path.join(finalDeathcamDir, `death_${formattedDate}.mp4`)

  const process = exec(`"${ffmpegPath}" -f concat -safe 0 -i "${fileListPath}" -c copy "${finalFile}"`, (error, stdout, stderr) => {
    if (error) {
      fs.rmSync(deathcamDir, { recursive: true, force: true })
      process.kill()
      resolve(null)
    } else {
      fs.rmSync(deathcamDir, { recursive: true, force: true })
      process.kill()
      resolve({ path: finalFile, length: validFiles.length })
    }
  })

  return await promise
}