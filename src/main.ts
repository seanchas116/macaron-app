import {app, BrowserWindow} from 'electron'
type BrowserWindow = Electron.BrowserWindow
const argv = require('minimist')(process.argv.slice(2))

let contentBase = argv.development ? 'http://localhost:23000' : `file://${app.getAppPath()}/dist`

let mainWindow: BrowserWindow|undefined

async function openWindow () {
  if (argv.development) {
    const {default: installExtension, REACT_DEVELOPER_TOOLS} = require('electron-devtools-installer')
    await installExtension(REACT_DEVELOPER_TOOLS)
  }

  const win = mainWindow = new BrowserWindow({
    width: 1200,
    height: 768,
    show: false
  })

  win.loadURL(`${contentBase}/index.html`)
  if (argv.development) {
    win.webContents.openDevTools()
  }

  win.on('closed', () => {
    mainWindow = undefined
  })

  win.on('ready-to-show', () => {
    win.show()
  })
}

app.commandLine.appendSwitch('enable-experimental-web-platform-features')

app.on('ready', async () => {
  await openWindow()
})
