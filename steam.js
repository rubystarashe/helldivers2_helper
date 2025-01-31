import WinReg from 'winreg'
import path from 'path'
import fs from 'fs/promises'

const getCurrentSteamUser = () => {
    return new Promise((resolve, reject) => {
        // Steam 레지스트리 경로
        const regKey = new WinReg({
            hive: WinReg.HKCU,
            key: '\\Software\\Valve\\Steam'
        })

        // AutoLoginUser 값을 읽어옴
        regKey.get('AutoLoginUser', (err, item) => {
            if (err) {
                reject(new Error(`Steam 사용자 정보를 찾을 수 없습니다: ${err.message}`))
                return
            }
            
            if (item?.value) {
                resolve(item.value);
            } else {
                reject(new Error('로그인된 Steam 사용자가 없습니다.'))
            }
        })
    })
}

const getSteamID64 = () => {
    return new Promise((resolve, reject) => {
        const regKey = new WinReg({
            hive: WinReg.HKCU,
            key: '\\Software\\Valve\\Steam\\ActiveProcess'
        })

        // ActiveUser 값을 읽어옴
        regKey.get('ActiveUser', (err, item) => {
            if (err) {
                reject(new Error(`Steam ID를 찾을 수 없습니다: ${err.message}`))
                return
            }
            
            if (item?.value && item.value !== '0') {  // 0은 로그인되지 않은 상태
                // 16진수 문자열을 10진수 정수로 변환
                const steamID = parseInt(item.value, 16)
                resolve(steamID.toString())
            } else {
                reject(new Error('활성화된 Steam 사용자가 없습니다.'))
            }
        })
    })
}

const getGameInstallPath = (appId) => {
    return new Promise((resolve, reject) => {
        // 먼저 Steam 설치 경로를 가져옴
        const steamRegKey = new WinReg({
            hive: WinReg.HKCU,
            key: '\\Software\\Valve\\Steam'
        })

        steamRegKey.get('SteamPath', (err, pathItem) => {
            if (err || !pathItem?.value) {
                reject(new Error('Steam 설치 경로를 찾을 수 없습니다.'));
                return
            }

            // 게임 설치 정보가 있는 레지스트리 키
            const gameRegKey = new WinReg({
                hive: WinReg.HKLM,  // HKEY_LOCAL_MACHINE
                key: `\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Steam App ${appId}`
            })

            gameRegKey.get('InstallLocation', (err, installItem) => {
                if (err || !installItem?.value) {
                    // 레지스트리에서 찾을 수 없는 경우 기본 경로 시도
                    const defaultPath = path.join(pathItem.value, 'steamapps', 'common', 'Helldivers 2')
                    resolve(defaultPath)
                } else {
                    resolve(installItem.value)
                }
            })
        })
    })
};

const getUserConfigPath = async (steamID64, appId) => {
    return new Promise((resolve, reject) => {
        const steamRegKey = new WinReg({
            hive: WinReg.HKCU,
            key: '\\Software\\Valve\\Steam'
        })

        steamRegKey.get('SteamPath', (err, pathItem) => {
            if (err || !pathItem?.value) {
                reject(new Error('Steam 설치 경로를 찾을 수 없습니다.'))
                return
            }

            const configPath = path.join(
                pathItem.value,
                'userdata',
                steamID64,
                appId,
                'remote',
                'input_settings.config'
            );
            resolve(configPath)
        });
    });
};

const parseConfigToJson = (configData) => {
    try {
        // 주석 제거 및 기본 정리
        const noComments = configData.replace(/\/\/.*$/gm, '').trim()
        
        // 각 줄을 처리하여 JSON 형식으로 변환
        const lines = noComments.split('\n').map(line => line.trim()).filter(Boolean)
        let jsonString = '{'
        let depth = 0
        let inArray = false
        let arrayContent = ''
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i]
            
            // 배열이나 객체의 시작
            if (line.includes('= [') || line.includes('= {')) {
                const key = line.split('=')[0].trim()
                const isArray = line.includes('[')
                jsonString += `"${key}":${isArray ? '[' : '{'}`
                depth++
                inArray = isArray
                continue
            }
            
            // 배열이나 객체의 끝
            if (line === ']' || line === '}') {
                if (arrayContent) {
                    jsonString += arrayContent
                    arrayContent = ''
                }
                jsonString = jsonString.replace(/,\s*$/, '') // 마지막 콤마 제거
                jsonString += line
                depth--
                if (i < lines.length - 1) jsonString += ','
                inArray = false
                continue
            }
            
            // 배열 내부의 숫자 값 처리
            if (inArray && !line.includes('=') && !isNaN(line)) {
                arrayContent += `${line},`
                continue
            }
            
            // 키-값 쌍 처리
            if (line.includes('=')) {
                const [key, ...valueParts] = line.split('=').map(part => part.trim())
                const value = valueParts.join('=') // 값에 = 가 포함될 수 있음
                
                // 숫자 처리
                if (!isNaN(value)) {
                    jsonString += `"${key}":${value},`
                }
                // 문자열 처리
                else if (value.startsWith('"') && value.endsWith('"')) {
                    jsonString += `"${key}":${value},`
                }
                // 그 외의 경우
                else {
                    jsonString += `"${key}":"${value}",`
                }
                continue
            }
            
            // 객체 시작
            if (line === '{') {
                jsonString += '{'
                depth++
                continue
            }
        }
        
        // 마지막 콤마 제거
        jsonString = jsonString.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')
        jsonString += '}'
        
        // 디버깅
        // console.log('Parsed JSON string:', jsonString)
        
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('설정 파싱 오류:', error);
        console.error('파싱 시도한 문자열:', jsonString)
        return null;
    }
};

const readUserConfig = async (steamID64, appId) => {
    try {
        const configPath = await getUserConfigPath(steamID64, appId)
        
        // 파일 존재 여부 확인
        try {
            await fs.access(configPath);
        } catch (error) {
            throw new Error(`설정 파일을 찾을 수 없습니다: ${configPath}`)
        }

        // 파일 읽기
        const configData = await fs.readFile(configPath, 'utf8')
        const parsedConfig = parseConfigToJson(configData)
        
        return {
            exists: true,
            path: configPath,
            data: configData,
            json: parsedConfig
        };
    } catch (error) {
        console.error('설정 파일 읽기 오류:', error.message)
        return {
            exists: false,
            path: null,
            data: null,
            json: null,
            error: error.message
        };
    }
};

const getSteamInfo = async () => {
    try {
        const username = await getCurrentSteamUser()
        const steamID64 = await getSteamID64()
        const gamePath = await getGameInstallPath('553850')
        const configInfo = await readUserConfig(steamID64, '553850')
        
        // console.log('현재 로그인된 사용자:', username)
        // console.log('Steam64 ID:', steamID64)
        // console.log('게임 설치 경로:', gamePath)
        // console.log('설정 파일 정보:', configInfo)
        
        return { 
            username, 
            steamID64, 
            gamePath,
            configInfo
        };
    } catch (error) {
        console.error('에러:', error.message)
        return null
    }
}

export {
    getCurrentSteamUser,
    getSteamID64,
    getGameInstallPath,
    getUserConfigPath,
    readUserConfig,
    getSteamInfo
};
