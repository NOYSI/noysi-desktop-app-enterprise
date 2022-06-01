import { Component, OnInit, OnDestroy } from '@angular/core';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import {Subject, Subscription } from 'rxjs';

import { Authenticator } from '../../shared/authenticator';

import { TranslateService } from 'ng2-translate';

import { configuration } from '../../../configuration';

const ipc = require('electron').ipcRenderer;

@Component({
    selector: 'forgot-password',
    templateUrl: './forgot-password.pug'
})
export class ForgotPasswordContainer implements OnInit, OnDestroy {

  forgotPasswordForm: FormGroup;

  authenticatorSubscription: Subscription;

  info: any;
  error: any;

  language: string;

  constructor(
    private authenticator: Authenticator,
    private formBuilder: FormBuilder,
    private translate: TranslateService
  ) {

  }

  ngOnInit() {
    this.language = localStorage.getItem('language') || 'en';
    this.forgotPasswordForm = this.formBuilder.group({
        email: ['', Validators.required]
    });
    this.authenticatorSubscription = this.authenticator.events.subscribe(
      next => {
        switch(next.type) {
          case 'forgot-password::success': {
            this.info = {
              title : {
                key : 'identity.forgot-password.success',
                arguments : {
                  email : this.forgotPasswordForm.value.email
                }
              },
              description : {
                key : 'identity.forgot-password.success_descr',
                arguments : {}
              }

            }
            break;
          }
          case 'forgot-password::error': {
            this.error = {
              title : {
                key : 'identity.sign-in.error.user_not_found',
                arguments : {
                  email : this.forgotPasswordForm.value.email
                }
              },
              description : {
                key : 'identity.sign-in.error.user_not_found_descr',
                arguments : {}
                }
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
    this.forgotPasswordForm.controls['email'].setValue(this.forgotPasswordForm.controls['email'].value.toLocaleLowerCase());
    const body = Object.assign({}, this.forgotPasswordForm.value, {language : this.language})
    this.authenticator.forgotPassword(body);
  }

  onLanguageChanged(value) {
    this.language = value || 'en';
    this.translate.use(this.language);
    localStorage.setItem('language', this.language)
  }

}
