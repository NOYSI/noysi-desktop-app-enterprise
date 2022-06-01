import * as teeny from 'teeny-conf';

export interface IOptions {
  minimizeOnClose: boolean;
  startOnLogin: boolean;
}

export class Options {
  private static _config: any;

  private static readonly defaults: IOptions = {
    minimizeOnClose: true,
    startOnLogin: false
  };

  static get config() {
    if (!Options._config) {
      Options._config = new teeny('.config');
      Options._config.loadOrCreateSync(Options.defaults);
    }
    return Options._config;
  }

}
