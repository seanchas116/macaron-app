import {remote} from 'electron'
const {Menu} = remote
import {autorun, observable} from 'mobx'
import {actionManager} from './ActionManager'

export interface MenuDescription extends Electron.MenuItemOptions {
  action?: string
  submenu?: MenuDescription[]
}

function menuDescriptionToElectron (description: MenuDescription): Electron.MenuItemOptions {
  const options: Electron.MenuItemOptions = {}
  Object.assign(options, description)
  if (description.action) {
    const action = actionManager.actions.get(description.action)
    if (action) {
      if (!options.label) {
        options.label = action.title
      }
      options.enabled = action.enabled
      options.click = () => action.run()
    }
  }
  if (description.submenu) {
    options.submenu = description.submenu.map(menuDescriptionToElectron)
  }
  return options
}

export class MenuBar {
  @observable template: MenuDescription[] = []

  constructor () {
    autorun(() => {
      const menu = Menu.buildFromTemplate(this.render())
      Menu.setApplicationMenu(menu)
    })
  }

  render () {
    return this.template.map(menuDescriptionToElectron)
  }
}

export const menuBar = new MenuBar()
