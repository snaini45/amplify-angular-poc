import { defineBackend } from '@aws-amplify/backend';
import auth from './auth/resource';
import storage from './storage/resource';
import data from './data/resource';

export default defineBackend({ auth, storage, data });
