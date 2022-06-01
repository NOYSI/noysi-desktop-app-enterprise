import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF, Location, LocationStrategy, HashLocationStrategy } from '@angular/common';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';

import { Routes, RouterModule } from '@angular/router';

import { Injectable, Component, OnInit, OnDestroy } from '@angular/core';

import { HttpModule, Http, Headers, RequestOptions} from '@angular/http';

import {TranslateModule, TranslateLoader, TranslateStaticLoader} from 'ng2-translate';

import {Observable, Subject } from 'rxjs';

import { SignInContainer } from './components/sign-in/sign-in';
import { SignUpContainer } from './components/sign-up/sign-up';
import { ForgotPasswordContainer } from './components/forgot-password/forgot-password';
import { OptionsContainer } from './components/options/options';

import { Authenticator } from './shared/authenticator';

import { TranslateService } from 'ng2-translate';

import { TooltipDirective } from 'ng2-tooltip-directive/components';

import './styles.scss';

const routes: Routes = [
  { path: 'sign-in', component: SignInContainer },
  { path: 'sign-up', component: SignUpContainer },
  { path: 'forgot-password', component: ForgotPasswordContainer },
  { path: 'options', component: OptionsContainer },
  { path: '', redirectTo: '/sign-in', pathMatch: 'full' }
];

@Component({
    selector: 'main',
    template: `
      <router-outlet></router-outlet>
    `
})
export class MainComponent implements OnInit {

  constructor(translate: TranslateService) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');

     // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use(localStorage.getItem('language') || 'en');
  }

  ngOnInit() {

  }

}

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (http: Http) => new TranslateStaticLoader(http, './assets/i18n', '.json'),
      deps: [Http]
    }),
    RouterModule.forRoot(routes)
  ],
  providers: [
    {provide: APP_BASE_HREF, useValue : '/' },
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    Location,
    Authenticator
  ],
  declarations: [MainComponent, SignUpContainer, SignInContainer, ForgotPasswordContainer, OptionsContainer, TooltipDirective],
  bootstrap: [ MainComponent ],
  entryComponents: []
})
export class MainModule {

  constructor() {

  }

}
