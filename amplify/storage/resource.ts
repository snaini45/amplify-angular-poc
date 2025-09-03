import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'userFiles',
  access: (allow) => ({
    'uploads/*': [
      allow.authenticated.to(['read', 'write']),
    ],
  }),
});