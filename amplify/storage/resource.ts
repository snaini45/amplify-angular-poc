import { defineStorage } from '@aws-amplify/backend-storage';

export default defineStorage({
  name: 'fileBucket',
  access: (allow) => ({
    'protected/*': [
      allow.authenticated.to(['get', 'list', 'write', 'delete']),
    ],
  }),
});
