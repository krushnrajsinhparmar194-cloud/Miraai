import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('desktopAPI', {
  pickFiles: () => ipcRenderer.invoke('files:pick'),
})
