import { Component, OnInit, OnDestroy } from '@angular/core';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import {Subject, Subscription } from 'rxjs';

import { Authenticator } from '../../shared/authenticator';

import { TranslateService } from 'ng2-translate';

import { configuration } from '../../../configuration';

const ipc = require('electron').ipcRenderer;

@Component({
    selector: 'sign-in',
    templateUrl: './sign-in.pug'
})
export class SignInContainer implements OnInit, OnDestroy {

  signInForm: FormGroup;

  authenticatorSubscription: Subscription;

  error: any;

  language: string;

  constructor(
    private authenticator: Authenticator,
    private formBuilder: FormBuilder,
    private translate: TranslateService
  ) {

  }

  _userNotFound() {
    this.error = {
      title : {
        key : 'general.warning',
        args: {}
      },
      description : {
        key : 'identity.sign-in.error.user_not_found_descr',
        args : {}
      }
    }
  }

  ngOnInit() {
    this.language = localStorage.getItem('language') || 'en';
    this.signInForm = this.formBuilder.group({
        email: ['', Validators.required],
        password: ['', Validators.required],
    });
    this.authenticatorSubscription = this.authenticator.events.subscribe(
      next => {
        switch(next.type) {
          case 'authentication::success': {
            ipc.send(next.type, next.payload);
            break;
          }
          case 'authentication::error': {

            if(next.error.status == 404) {

              this._userNotFound();

            } else {

              console.error(next.error)

            }

          }
        }
      }
    );

  }

  ngOnDestroy() {
    this.authenticatorSubscription.unsubscribe();
  }

  onSubmit() {
    if(this.signInForm.invalid) {
      this._userNotFound();
      return;
    }
    this.signInForm.controls['email'].setValue(this.signInForm.controls['email'].value.toLocaleLowerCase());
    this.authenticator.signIn(this.signInForm.value);
  }

  onLanguageChanged(value) {
    this.language = value || 'en';
    this.translate.use(this.language);
    localStorage.setItem('language', this.language)
  }

}
