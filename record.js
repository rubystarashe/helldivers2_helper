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

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

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

let lastoption
export const start_recorder = (options = {}) => {
  if (recorder) return

  const { monitor, framerate, rect, quality, duration } = options

  if (!monitor || !rect || !framerate || !quality || !duration) return
  lastoption = options
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
    x: Math.max(0, rect.x - monitor.x),
    y: Math.max(0, rect.y - monitor.y),
    width: parseInt(Math.min(monitor.width, rect.width)),
    height: parseInt(Math.min(monitor.height, rect.height))
  }

  // 가장 최근에 수정된 파일의 번호를 찾아 시작 번호 설정
  const lastSegment = fs.readdirSync(tempDir)
    .filter(file => file.startsWith("segment_") && file.endsWith(".mp4"))
    .map(file => ({
      name: file,
      time: fs.statSync(path.join(tempDir, file)).mtimeMs
    }))
    .sort((a, b) => b.time - a.time)[0]
    // .map(file => parseInt(file.name.match(/segment_(\d+)\.mp4/)[1], 10))
    // .reduce((max, num) => Math.max(max, num), 0)

  const existingSegments = lastSegment ? parseInt(lastSegment.name.match(/segment_(\d+)\.mp4/)[1], 10) : 0

  const args = [
    '-f', 'lavfi',             // lavfi 입력 사용
    '-i', `ddagrab=output_idx=${monitor.index}:framerate=${framerate}:video_size=${monitor_rect.width}x${monitor_rect.height}:offset_x=${monitor_rect.x}:offset_y=${monitor_rect.y}`,           // ddagrab 필터 (Desktop Duplication API 사용)

    '-c:v', 'h264_nvenc',      // NVIDIA 하드웨어 인코더 사용
    '-cq:v', String(quality),             // 품질(quantizer) 옵션
    '-g', String(framerate),
    '-sc_threshold', '0',

    '-f', 'segment',           // segment muxer 사용
    '-segment_start_number', String(existingSegments), // 시작 번호 설정
    '-segment_time', '1',      // 1초 단위로 분할
    '-segment_wrap', String(duration + 1), // 최대 세그먼트 수(예: duration이 10이면 최신 10초)
    '-reset_timestamps', '1',  // 각 세그먼트의 타임스탬프 초기화
    path.join(tempDir, 'segment_%03d.mp4')
  ]

  // console.log(`ddagrab=output_idx=${monitor.index}:framerate=${framerate}:video_size=${monitor_rect.width}x${monitor_rect.height}:offset_x=${monitor_rect.x}:offset_y=${monitor_rect.y}`)

  recorder = spawn(ffmpegPath, args, {
    windowsHide: true,
    // stdio: ['ignore', 'pipe', 'pipe'] // 표준 출력과 표준 에러를 캡처
  })

  // // 표준 출력 로그
  // recorder.stdout.on('data', (data) => {
  //   console.log('FFmpeg stdout:', data.toString());
  // });

  // 표준 에러 로그
  recorder.stderr.on('data', (data) => {
    // console.log(data.toString())
    if (data.toString().includes('Conversion failed')) {
      pause_recorder()
      start_recorder(lastoption)
    }
  })

  // // 기존의 에러 이벤트 처리
  // recorder.on('error', (err) => {
  //   console.error('Recorder error:', err);
  // })

  // recorder.on('exit', (code, signal) => {
  //   console.log(`Recorder exited with code ${code} and signal ${signal}`)
  // })
}

export const restart_recorder = () => {
  pause_recorder()
  start_recorder(lastoption)
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

  const fileListPath = path.join(workdir, 'filelist.txt')
  const fileListContent = validFiles.map(f => `file '${f.replace(/'/g, "'\\''")}'`).join('\n')
  try {
    fs.writeFileSync(fileListPath, fileListContent) 
  } catch (e) {
    return null
  }

  // GMT 시간으로 현재 날짜와 시간을 포맷하여 파일 이름 생성
  const now = new Date()
  const gmtDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  const formattedDate = gmtDate.toISOString().replace(/T/, '-').replace(/:/g, '-').split('.')[0]
  if (!fs.existsSync(finalDir)) {
    fs.mkdirSync(finalDir, { recursive: true })
  }
  const finalFile = path.join(finalDir, `${formattedDate}.mp4`)

  const concatCmd = `"${ffmpegPath}" -f concat -safe 0 -i "${fileListPath}" -c copy "${finalFile}"`
  // restart_recorder()
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

export const save_death_cam = async (seconds, deathcam_webp) => {
  if (!recorder) return

  const { promise, resolve, reject } = Promise.withResolvers()

  if (!fs.existsSync(deathcamDir)) {
    fs.mkdirSync(deathcamDir, { recursive: true })
  }

  const files = fs.readdirSync(tempDir)
    .filter(file => file.startsWith("segment_") && file.endsWith(".mp4"))
    .map(file => ({ path: path.join(tempDir, file), name: file }))

  if (files.length === 0) return

  files.sort((a, b) => fs.statSync(a.path).mtimeMs - fs.statSync(b.path).mtimeMs)

  // Promise.all을 사용하여 병렬로 ffprobe 실행
  const validFiles = await Promise.all(files.slice().reverse().map(async (file) => new Promise(async (resolve, reject) => {
    const dest = path.join(deathcamDir, file.name)
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
  }))).then(results => results.filter(file => file !== null).slice(0, seconds))

  if (validFiles.length === 0) return
  validFiles.reverse()

  const fileListPath = path.join(deathcamDir, 'filelist.txt')
  const fileListContent = validFiles.map(f => `file '${f.replace(/'/g, "'\\''")}'`).join('\n')
  try {
    fs.writeFileSync(fileListPath, fileListContent)
  } catch (e) {
    return null
  }

  // GMT 시간으로 현재 날짜와 시간을 포맷하여 파일 이름 생성
  const now = new Date()
  const gmtDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  const formattedDate = gmtDate.toISOString().replace(/T/, '-').replace(/:/g, '-').split('.')[0]
  if (!fs.existsSync(finalDeathcamDir)) {
    fs.mkdirSync(finalDeathcamDir, { recursive: true })
  }
  const finalFile = path.join(finalDeathcamDir, `death_${formattedDate}.mp4`)

  // restart_recorder()
  const process = exec(`"${ffmpegPath}" -f concat -safe 0 -i "${fileListPath}" -c copy "${finalFile}"`, (error, stdout, stderr) => {
    if (error) {
      fs.rmSync(deathcamDir, { recursive: true, force: true })
      process.kill()
      resolve(null)
    } else {
      fs.rmSync(deathcamDir, { recursive: true, force: true })
      process.kill()
      const webp = async () => {
        while (!fs.existsSync(finalFile)) {
          await sleep(500)
        }
        convertVideoToWebP(finalFile, path.join(finalDeathcamDir, `death_${formattedDate}.webp`), 20, Math.min(lastoption.framerate || 1, 30), 3)
      }
      if (deathcam_webp) webp()
      resolve({ path: finalFile, length: validFiles.length })
    }
  })


  return await promise
}


const getVideoInfo = (videoPath) => {
  const command = `"${ffmpegProbePath}" -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of json "${videoPath}"`
  const output = execSync(command)
  const info = JSON.parse(output)
  const { width, height, r_frame_rate } = info.streams[0]
  const fps = eval(r_frame_rate)
  return { width, height, fps }
}
const calculateScale = (originalSize, targetSize, originalFps, targetFps, ziprate) => {
  const fpsRatio = originalFps / targetFps; // FPS 차이가 적을수록 스케일이 낮아져야 함
  const sizeRatio = targetSize / originalSize; // 용량 차이가 클수록 스케일이 낮아져야 함
  return Math.max(0.5, Math.min(0.92, Math.sqrt(fpsRatio * sizeRatio) / ziprate))
}

const adjustScale = (currentSize, targetSize, currentScale) => {
  const sizeRatio = targetSize / currentSize
  return currentScale * Math.sqrt(sizeRatio) / 1.1
}

export const convertVideoToWebP = async (videoPath, outputPath, targetSizeMB, targetFps = 30, ziprate = 4) => {
  // const targetSize = targetSizeMB * 1024 * 1024
  const targetSize = targetSizeMB * 1000 * 1000
  const originalSize = fs.statSync(videoPath).size
  const { width, height, fps: originalFps } = getVideoInfo(videoPath)

  let scale = calculateScale(originalSize, targetSize, originalFps, targetFps, ziprate)
  let currentSize = Infinity

  while (currentSize > targetSize) {
    const scaleFilter = `scale=iw*${scale}:ih*${scale}`
    // console.log(`Attempting WebP conversion with scale: ${scale}`)
    try {
      // WebP 생성
      await execPromise(`"${ffmpegPath}" -i "${videoPath}" -vf "${scaleFilter},fps=${targetFps}" -c:v libwebp -lossless 0 -compression_level 4 -q:v 75 -preset default -an -threads 4 -y "${outputPath}"`)
      currentSize = fs.statSync(outputPath).size
      // console.log(`Current WebP size: ${currentSize} bytes`)
      if (currentSize > targetSize) {
        scale = adjustScale(currentSize, targetSize, scale)
      } else {
        fs.rmSync(videoPath, { recursive: true, force: true })
      }
    } catch (error) {
      // console.log(error)
      break
    }
  }
  // console.log(`Final WebP size: ${currentSize} bytes`)
};

