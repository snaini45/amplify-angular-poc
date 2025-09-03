import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  FileEntry: a
    .model({
      owner: a.string().authorization((allow) => [allow.owner()]),
      fileName: a.string(),
      s3Key: a.string(),
      uploadedAt: a.datetime(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool', // ensures only logged-in users access data
  },
});
