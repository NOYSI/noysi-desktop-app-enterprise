import { Component, OnInit, OnDestroy } from '@angular/core';

import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { Subject, Subscription } from 'rxjs';

import { Authenticator } from '../../shared/authenticator';

import { TranslateService } from 'ng2-translate';

import { configuration } from '../../../configuration';

const ipc = require('electron').ipcRenderer;

@Component({
  selector: 'sign-up',
  templateUrl: './sign-up.pug'
})
export class SignUpContainer implements OnInit, OnDestroy {

  signUpForm: FormGroup;

  authenticatorSubscription: Subscription;

  error: any;

  language: string;

  passw: Password = Password;

  constructor(
    private authenticator: Authenticator,
    private formBuilder: FormBuilder,
    private translate: TranslateService
  ) {

  }

  ngOnInit() {
    this.language = localStorage.getItem('language') || 'en';
    this.signUpForm = this.formBuilder.group({
      email: ['',
        Validators.compose([
          Validators.required,
          Validators.minLength(5),
          Email.check
        ])
      ],
      password: ['',
        Validators.compose([
          Validators.required,
          Password.check
        ])
      ],
    });
    this.authenticatorSubscription = this.authenticator.events.subscribe(
      next => {
        switch (next.type) {
          case 'authentication::success': {
            next.payload.language = this.language;
            ipc.send(next.type, next.payload);
            break;
          }
          case 'sign-up::error': {

            if (next.error.status == 409) {

              this.error = {
                title: {
                  key: 'general.warning',
                  args: {}
                },
                description: {
                  key: 'identity.sign-up.warning.user_already_exists',
                  args: {}
                }
              }

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
    if (this.signUpForm.invalid) {
      this.error = {
        title: {
          key: 'general.warning',
          args: {}
        },
        description: {
          key: 'identity.sign-up.error.invalid',
          args: {}
        }
      }
      return;
    }

    this.signUpForm.controls['email'].setValue(this.signUpForm.controls['email'].value.toLocaleLowerCase());

    const credentials = Object.assign({}, this.signUpForm.value, { language: this.language, terms_accepted: true })
    this.authenticator.signUp(credentials);
  }

  onLanguageChanged(value) {
    this.language = value || 'en';
    this.translate.use(this.language);
    localStorage.setItem('language', this.language)
  }

}

interface IValidationResult {
  [key: string]: boolean;
}

interface IPasswordOptions {
  KO: boolean;
  strength: string;
}

class Password {

  static options: IPasswordOptions = {
    KO: true,
    strength: null
  }

  static check(control: FormControl): IValidationResult {

    const strongPass = new RegExp("^(?=.*[0-9])(?=.*[a-z\u0430-\u044F])(?=.*[A-Z\u0410-\u042F])(?=.*[^a-zA-Z0-9\u0430-\u044F\u0410-\u042F]).{10,200}$");
    const mediumPass = new RegExp("^(?=.*[0-9])(?=.*[a-z\u0430-\u044F])(?=.*[A-Z\u0410-\u042F]).{8,200}$");

    if (strongPass.test(control.value)) {
      Password.options.strength = "strong";
      Password.options.KO = false;
    } else if (mediumPass.test(control.value)) {
      Password.options.strength = "medium";
      Password.options.KO = false;
    } else if (control.value) {
      Password.options.strength = "weak";
      Password.options.KO = true;
    } else {
      Password.options.strength = null;
      Password.options.KO = true;
    }

    return Password.options.KO ? { 'passwordStrength': true } : null;
  };

}


export class Email {

  static check(control: FormControl): IValidationResult {

    var EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (control.value != "" && (control.value.length <= 5 || !EMAIL_REGEXP.test(control.value))) {
      return { "incorrectMailFormat": true };
    }

    return null;
  }

}
