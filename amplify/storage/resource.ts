import { defineStorage } from '@aws-amplify/backend-storage';

export default defineStorage({
  name: 'fileBucket',
  access: (allow) => ({
    // Folder/object prefix rule must end with '/*'
    // Use 'get' (not 'read') + include 'list' here
    'protected/*': [
      allow.authenticated.to(['get', 'list', 'write', 'delete']),
    ],
  }),
});
