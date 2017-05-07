import {remote} from 'electron'
import {menuBar, MenuDescription} from '../modules/menu/MenuBar'
const {app} = remote

const template: MenuDescription[] = [
  {
    label: 'File',
    submenu: [
      {action: 'file.new', accelerator: 'CommandOrControl+N'},
      {action: 'file.open', accelerator: 'CommandOrControl+O'},
      {type: 'separator'},
      {action: 'file.save', accelerator: 'CommandOrControl+S'},
      {action: 'file.saveAs', accelerator: 'Shift+CommandOrControl+S'}
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {action: 'edit.undo', accelerator: 'CommandOrControl+Z'},
      {action: 'edit.redo', accelerator: 'CommandOrControl+Y'},
      {type: 'separator'},
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
      {role: 'pasteandmatchstyle'},
      {role: 'delete'},
      {role: 'selectall'}
    ]
  },
  {
    label: 'Item',
    submenu: [
      {action: 'item.group', accelerator: 'CommandOrControl+G'},
      {action: 'item.ungroup', accelerator: 'Shift+CommandOrControl+G'}
    ]
  },
  {
    label: 'View',
    submenu: [
      {role: 'reload'},
      {role: 'forcereload' as Electron.MenuItemRole},
      {role: 'toggledevtools'},
      {type: 'separator'},
      {role: 'resetzoom'},
      {role: 'zoomin'},
      {role: 'zoomout'},
      {type: 'separator'},
      {role: 'togglefullscreen'}
    ]
  },
  {
    role: 'window',
    submenu: [
      {role: 'minimize'},
      {role: 'close'}
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { require('electron').shell.openExternal('https://electron.atom.io') }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      {role: 'about'},
      {type: 'separator'},
      {role: 'services', submenu: []},
      {type: 'separator'},
      {role: 'hide'},
      {role: 'hideothers'},
      {role: 'unhide'},
      {type: 'separator'},
      {role: 'quit'}
    ]
  })

  // Edit menu
  template[2].submenu![1].accelerator = 'Shift+CommandOrControl+Z'
  template[2].submenu!.push(
    {type: 'separator'},
    {
      label: 'Speech',
      submenu: [
        {role: 'startspeaking'},
        {role: 'stopspeaking'}
      ]
    }
  )

  // Window menu
  template[4].submenu = [
    {role: 'close'},
    {role: 'minimize'},
    {role: 'zoom'},
    {type: 'separator'},
    {role: 'front'}
  ]
}

menuBar.template = template
