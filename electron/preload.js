const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("api", {
  send: (channel, data) => {
    let validChannels = ["minimize", "quit", "maximize"]
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
})