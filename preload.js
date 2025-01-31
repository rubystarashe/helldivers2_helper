const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (event, message) => ipcRenderer.send(event, message),
  invoke: async (event, message) => ipcRenderer.invoke(event, message),
  on: (event, cb) => {
    const _cb = (e, m) => cb(m)
    ipcRenderer.on(event, _cb)
    return _cb
  },
  open: (event, cb, message) => {
    ipcRenderer.send(event, message)
    ipcRenderer.on(event, (e, m) => cb(m))
  },
  listen: (event, message, cb) => {
    ipcRenderer.send(event, message)
    ipcRenderer.on(event, (e, m) => cb(m))
  }
})
