const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("api", {
  send: (channel, data) => {
    let validChannels = ["minimize", "quit", "maximize", "acessGithub"]
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
})