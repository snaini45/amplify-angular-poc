import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json'; // adjust path if needed

Amplify.configure(outputs);

bootstrapApplication(AppComponent).catch(err => console.error(err));
