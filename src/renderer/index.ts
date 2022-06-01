import 'core-js/es6';
import 'core-js/es7/reflect';
import "zone.js/dist/zone";

// Angular 2
import '@angular/platform-browser';
import '@angular/platform-browser-dynamic';
import '@angular/core';
import '@angular/common';
import '@angular/forms';
import '@angular/http';

// RxJS
import 'rxjs/Rx'

import {ApplicationRef} from '@angular/core';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import {enableDebugTools} from '@angular/platform-browser';

import { MainModule } from './main.module';

platformBrowserDynamic()
  .bootstrapModule(MainModule)
  .then((ngModule: any) => {
    const ngApp = ngModule.injector.get(ApplicationRef);
    const rootComponent = ngApp.components[0];
    enableDebugTools(rootComponent);

    // let _ng = (<any>window).ng;
    // (<any>window).ng.probe = _ng.probe;
    // (<any>window).ng.coreTokens = _ng.coreTokens;
    return ngModule;
  })
  .catch(err => console.error(err));
