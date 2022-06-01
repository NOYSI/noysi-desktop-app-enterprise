import { Injectable, Component, OnInit, OnDestroy } from '@angular/core';

import { Observable, Subject } from 'rxjs';

const reqwest = require('reqwest');

import { configuration } from '../../configuration';

export class AuthenticationError extends Error {

  status: number;

  cause: any;

  constructor(message:string) {
    super(message);
  }

}

@Injectable()
export class Authenticator {

  events: Subject<any> = new Subject();

  constructor() {

  }

  _options(options: any) {

    var settings = '';

    for (var key in options) {
      settings += key + '=' + options[key] + ',';
    }

    return settings.slice(0, -1);

  }

  window(url:string, name: string, options = {}) {
    return window.open(url, name, this._options(options));
  }

  redirect(url : string) {
    window.location.href = url;
  }

  post(url: string, body : any) {
    return Observable.create((observer) => {
      const request = reqwest({
        url:             url,
        method:          'post',
        type:            'json',
        data:            body,
        crossOrigin:     true,
        withCredentials: true,
        timeout:         3000
      }).fail((e) => {
        const error = new AuthenticationError(e.responseText);
        error.status = e.status;
        error.cause = e;
        observer.error(e);
      }).then((r) => {
        observer.next(request.request);
        observer.complete();
      })
    });
  }
  //
  signIn(credentials) {
    this.post(`${configuration.origin.api}/identity/sign-in`, JSON.stringify(credentials)).subscribe(
      request => {
        const token = request.getResponseHeader('X-Subject-Token');
        const refreshToken = JSON.parse(request.response).refreshToken;
        this.events.next({ type: 'authentication::success', payload: { token: token, refreshToken: refreshToken}})
      },
      error => {
        this.events.next({type : 'authentication::error', error});
      }
    );
  }

  signUp(credentials) {
    this.post(`${configuration.origin.api}/identity/sign-up`, JSON.stringify(credentials)).subscribe(
      request => {
        const token = request.getResponseHeader('X-Subject-Token');
        const refreshToken = JSON.parse(request.response).refreshToken;
        this.events.next({type: 'authentication::success', payload : {token : token, refreshToken: refreshToken}})
      },
      error => {
        this.events.next({type : 'sign-up::error', error});
      }
    );
  }

  forgotPassword(body) {
    this.post(`${configuration.origin.api}/identity/forgot-password`, JSON.stringify(body)).subscribe(
      request => {
        this.events.next({type: 'forgot-password::success'})
      },
      error => {
        this.events.next({type : 'forgot-password::error', error});
      }
    );
  }

}
