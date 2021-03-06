import { remote } from 'electron'
import { menuBar, MenuDescription } from '../modules/menu'
const {app} = remote

const fileMenu: MenuDescription = {
  label: 'File',
  submenu: [
    {action: 'file.new', accelerator: 'CommandOrControl+N'},
    {action: 'file.open', accelerator: 'CommandOrControl+O'},
    {type: 'separator'},
    {action: 'file.save', accelerator: 'CommandOrControl+S'},
    {action: 'file.saveAs', accelerator: 'Shift+CommandOrControl+S'}
  ]
}

const editMenu: MenuDescription = {
  label: 'Edit',
  submenu: [
    {action: 'edit.undo', accelerator: 'CommandOrControl+Z'},
    {action: 'edit.redo', accelerator: 'CommandOrControl+Y'},
    {type: 'separator'},
    {action: 'edit.cut', accelerator: 'CommandOrControl+X'},
    {action: 'edit.copy', accelerator: 'CommandOrControl+C'},
    {action: 'edit.paste', accelerator: 'CommandOrControl+V'},
    {role: 'delete'},
    {role: 'selectall'}
  ]
}

const itemMenu: MenuDescription = {
  label: 'Item',
  submenu: [
    {action: 'item.group', accelerator: 'CommandOrControl+G'},
    {action: 'item.ungroup', accelerator: 'Shift+CommandOrControl+G'}
  ]
}
const viewMenu: MenuDescription = {
  label: 'View',
  submenu: [
    {role: 'reload'},
    {role: 'forcereload'},
    {role: 'toggledevtools'},
    {type: 'separator'},
    {role: 'resetzoom'},
    {role: 'zoomin'},
    {role: 'zoomout'},
    {type: 'separator'},
    {role: 'togglefullscreen'}
  ]
}
const windowMenu: MenuDescription = {
  role: 'window',
  submenu: [
    {role: 'minimize'},
    {role: 'close'}
  ]
}
const helpMenu: MenuDescription = {
  role: 'help',
  submenu: [
    {
      label: 'Learn More',
      click () { require('electron').shell.openExternal('https://electron.atom.io') }
    }
  ]
}

const template = [fileMenu, editMenu, itemMenu, viewMenu, windowMenu, helpMenu]

if (process.platform === 'darwin') {
  const appMenu: MenuDescription = {
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
  }
  template.unshift(appMenu)

  editMenu.submenu![1].accelerator = 'Shift+CommandOrControl+Z'
  editMenu.submenu!.push(
    {type: 'separator'},
    {
      label: 'Speech',
      submenu: [
        {role: 'startspeaking'},
        {role: 'stopspeaking'}
      ]
    }
  )

  windowMenu.submenu = [
    {role: 'close'},
    {role: 'minimize'},
    {role: 'zoom'},
    {type: 'separator'},
    {role: 'front'}
  ]
}

menuBar.template = template
