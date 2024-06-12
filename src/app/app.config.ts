import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideHttpClient} from "@angular/common/http";
import {InMemoryWebApiModule} from "angular-in-memory-web-api";
import {LearningPathData} from "./core/services/learning-path/learning-path.data";
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import {provideAnimations} from "@angular/platform-browser/animations";


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    importProvidersFrom(InMemoryWebApiModule.forRoot(LearningPathData, { delay: 1000, passThruUnknownUrl: true })),
    importProvidersFrom(provideFirebaseApp(() => initializeApp({"projectId":"learndotnetfast","appId":"1:523066733452:web:5eab92ebb18500a1695ca9","storageBucket":"learndotnetfast.appspot.com","apiKey":"AIzaSyCPOxlp3Xt5eUuMDDgmE0cG3y4-ZpfPhmc","authDomain":"learndotnetfast.firebaseapp.com","messagingSenderId":"523066733452"}))),
    importProvidersFrom(provideAuth(() => getAuth())),]
};
