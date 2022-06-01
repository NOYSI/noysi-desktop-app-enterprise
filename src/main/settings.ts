import * as es6 from 'core-js/es6';
import * as fse from 'fs-extra';
import * as path from 'path';

const home = path.join(process.env.HOME || process.env.USERPROFILE, 'noysi');
const dot = path.join(home, '.noysi');
fse.ensureDirSync(dot);

export class Settings {

  file: any;

  constructor() {
    this.file = path.join(dot, 'settings.json');
  }

  read() {

    return new es6.Promise((resolve, reject) => {

      fse.readFile(this.file, (error, data) => {
        if(error) {
          resolve({});
        } else {
          resolve(JSON.parse(data.toString()));
        }
      });

    });

  }

  write(settings) {

    return new es6.Promise((resolve, reject) => {

      fse.writeFile(this.file, JSON.stringify(settings), error => {
        if(error) {
          reject(error);
        } else {
          resolve();
        }
      });

    });

  }

}
