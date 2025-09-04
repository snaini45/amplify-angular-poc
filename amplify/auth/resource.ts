import { defineAuth } from '@aws-amplify/backend-auth';

export default defineAuth({
  loginWith: { email: true }, // email/password
});
