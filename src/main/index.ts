import * as path from 'path';
import * as electron from 'electron';
const PDFWindow = require('electron-pdf-window');
const {app, ipcMain, BrowserWindow, Menu, MenuItem, Tray} = electron;

import { Settings } from './settings';
import { Options } from '../options';

const contextMenu = require('electron-context-menu');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let tray: Electron.Tray;
let splashWindow
let quit = false;

import { configuration } from '../configuration';

function createMenu() {

    const template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Quit',
            accelerator: 'CmdOrCtrl+Q',
            click: function() { app.quit(); }
          },
          {
            label: 'Options',
            click() {
              openOptionsContainer();
            }
          }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          {
            label: 'Cut',
            accelerator: 'CmdOrCtrl+X',
            selector: 'cut:'
          }, {
            label: 'Copy',
            accelerator: 'CmdOrCtrl+C',
            selector: 'copy:'
          }, {
            label: 'Paste',
            accelerator: 'CmdOrCtrl+V',
            selector: 'paste:'
          }, {
            label: 'Select All',
            accelerator: 'CmdOrCtrl+A',
            selector: 'selectAll:'
          }
        ]
      },
      {
        label: 'Window',
        submenu: [
          {
            label: 'Reload',
            accelerator: 'CmdOrCtrl+R',
            click (item, window) {
              if (window) window.reload()
            }
          },
          {
            label: 'Toggle Developer Tools',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
            click (item, focusedWindow) {
              if (focusedWindow) focusedWindow.webContents.toggleDevTools()
            }
          }
        ]
      }
    ];

    if (process.platform === 'darwin') {
      template[0].submenu.pop();
    }

    const m = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(m);

    contextMenu({ window: mainWindow, showInspectElement: false });

}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: 'noysi',
    resizable: true,
    minWidth: 1025,
    minHeight: 768,
    width: 1366,
    height: 768,
    center: true,
    show: true,
    frame: true,
    autoHideMenuBar: true,
    icon: path.join(__dirname, './assets/icon.png'),
    //titleBarStyle: 'hidden-inset',
    webPreferences: {
      javascript: true,
      plugins: true,
      //nodeIntegration: false,
      webSecurity: false,
      //preload: path.join(__dirname, ''),
    }
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.on('close', (e) => {
    if (!quit) {
      e.preventDefault();
      if (process.platform === 'darwin') {
        app.hide();
      } else if (Options.config.get('minimizeOnClose')) {
        mainWindow.hide();
      } else {
        app.quit();
      }
    }
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  mainWindow.webContents.on('will-navigate', (ev, url) => {
    if (/sign-out$/.test(url)) {
      ev.preventDefault();
      settings.write({}).then(() => {
        mainWindow.loadURL(`file://${__dirname}/index.html#/sign-in`);
      }).catch(error => {
        console.log(error);
      });
    }
  });

  mainWindow.webContents.on('new-window', (e, url, frameName, disposition, options, additionalFeatures) => {
    if(url.indexOf('https://accounts.google.com') === 0) {

    } else if (url.indexOf('https://meet.noysi.com/') === 0 || /^((?!noysi\.com).)*$/.test(url)) {
      e.preventDefault();
      electron.shell.openExternal(url);
    } else {
      e.preventDefault();
      console.log(PDFWindow)
      let popup = new PDFWindow({
        title: '',
        resizable: true,
        minWidth: 800,
        minHeight: 600,
        width: 800,
        height: 600,
        center: true,
        show: true,
        frame: true,
        autoHideMenuBar: true,
        icon: path.join(__dirname, './assets/icon.png'),
        //titleBarStyle: 'hidden-inset',
        webPreferences: {
          javascript: true,
          plugins: true,
          //nodeIntegration: false,
          webSecurity: false,
          //preload: path.join(__dirname, ''),
        }
      })
      popup.loadURL(url)
      //popup.webContents.openDevTools()
      popup.on('closed', function () {
        popup = null
      })


    }
  });

  mainWindow.webContents.session.on('will-download', (event, url, filename, mimeType, userGesture) => {
    const focused = BrowserWindow.getFocusedWindow();
    if(focused != mainWindow) {
      focused.close();
    }
  });

  const webapp = (token, refreshToken) => {
    mainWindow.loadURL(`${configuration.origin.web}/authorize?language=en&token=${token}&refreshtoken=${refreshToken}`)
  }

  const identity = () => {
    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/index.html`)
  }

  settings.read().then((data:any) => {
    if (data['token'] && data['refreshToken']) {
      webapp(data['token'], data['refreshToken']);
    } else {
      identity()
    }
  });

  ipcMain.on("authentication::success", (event, data) => {
    settings.write({ token: data.token, refreshToken: data.refreshToken}).then(() => {
      mainWindow.loadURL(`${configuration.origin.web}/authorize?language=${data.language}&token=${data.token}&refreshToken=${data.refreshToken}`)
    }).catch(error => {
      console.log(error);
    });
  })

  ipcMain.on("open", (event, data) => {
    electron.shell.openExternal(data.payload.url)
  })

  createMenu();
  createTray();

}

const settings = new Settings();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {

  createWindow();

  //splashWindow = new SplashWindow();

  // setTimeout(() => {
  //   splashWindow.hide();
  //   //this.wechatWindow.show();
  // }, 4000);
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('before-quit', function () {
  quit = true;
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


const openOptionsContainer = () => {
  let configMenuWindow = new BrowserWindow({
    height: 335,
    resizable: false,
    width: 600,
    title: 'Options',
    minimizable: false,
    maximizable:false,
    fullscreenable: false,
    parent: mainWindow,
    modal: true,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    center: true,
    frame: false,
    icon: path.join(__dirname, './assets/icon.png'),
    skipTaskbar: true,
    titleBarStyle: 'hidden'
  });

  configMenuWindow.loadURL(`file://${__dirname}/index.html#/options`);

  configMenuWindow.on('closed', () => {
    configMenuWindow = null;
  });
}

const createTray = () => {
  tray = new Tray(path.join(__dirname, './assets/icon-18px.png'));
  tray.setToolTip('Noysi');

  const toggleWin = () => {
    if (Options.config.get('minimizeOnClose')) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    } else {
      if (mainWindow.isVisible() && !mainWindow.isMinimized()) {
        mainWindow.minimize();
      } else {
        mainWindow.show();
      }
    }
  };

  const contextMenu = electron.Menu.buildFromTemplate([
    {
      label: 'Show/Hide',
      click: toggleWin
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit'
      , click() {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (!mainWindow.isVisible() || mainWindow.isMinimized() || !mainWindow.isFocused()) {
      mainWindow.show();
    }
  });
}
