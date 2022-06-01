import { Component, OnInit} from '@angular/core';
import * as path from 'path';
import * as electron from 'electron';
const {remote} = electron;
import { Options, IOptions } from '../../../options';

@Component({
    selector: 'options',
    templateUrl: './options.pug'
})
export class OptionsContainer implements OnInit {

  options: IOptions;
  platform: string;

  constructor() {
    this.platform = process.platform;
  }

  ngOnInit() {
    this.options = Options.config.getAll();
  }

  onSubmit() {
    remote.app.setLoginItemSettings({ openAtLogin: this.options.startOnLogin });
    for (let key in this.options) {
      Options.config.set(key, this.options[key]);
    }
    Options.config.saveSync();
    remote.getCurrentWindow().close();
  }

}
