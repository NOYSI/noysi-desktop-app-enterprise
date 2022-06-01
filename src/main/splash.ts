/**
 * Created by Zhongyi on 5/1/16.
 */
//'use strict';

import * as path from 'path';
import { BrowserWindow } from 'electron';

export class SplashWindow {

  splashWindow: Electron.BrowserWindow;

  isShown: boolean;

  constructor() {
    this.splashWindow = new BrowserWindow({
      width: 400,
      height: 400,
      title: 'noysi',
      resizable: false,
      center: true,
      show: true,
      frame: false,
      autoHideMenuBar: true,
      alwaysOnTop: true,
      icon: 'assets/icon.png',
      titleBarStyle: 'hidden',
    });

    this.splashWindow.loadURL('file://' + path.join(__dirname, './splash.html'));
    this.isShown = false;
  }

  show() {
    this.splashWindow.show();
    this.isShown = true;
  }

  hide() {
    this.splashWindow.hide();
    this.isShown = false;
  }

}
