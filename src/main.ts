import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

import { Amplify } from 'aws-amplify';

// JSON imports are supported via TypeScript configuration (resolveJsonModule).

import outputs from '../amplify_outputs.json'; 

Amplify.configure(outputs);

bootstrapApplication(AppComponent).catch(err => console.error(err));
