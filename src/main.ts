import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { Amplify } from 'aws-amplify';
import outputs from './assets/amplify_outputs.json';

Amplify.configure(outputs);

bootstrapApplication(AppComponent).catch(err => console.error(err));
