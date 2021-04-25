const { app, ipcMain, BrowserWindow } = require("electron")
const path = require("path")

let win
const App = {
  createWindow() {
    win = new BrowserWindow({
      width: 1000,
      height: 700,
      minWidth: 1000,
      minHeight: 700,
      frame: false,
      icon: path.join(__dirname, '../assets/logo/png/64x64.png'),
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    })

    win.loadFile("index.html")
  },
}

// ipcMain.on('minimize', (event, message) => {})
ipcMain.on("minimize", () => {
  win.minimize()
})

ipcMain.on("maximize", () => {
  win.isMaximized() ? win.restore() : win.maximize()
})

ipcMain.on("quit", () => {
  app.quit()
})

app.whenReady().then(App.createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})
