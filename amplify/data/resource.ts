import { defineData } from '@aws-amplify/backend-data';
import type { ClientSchema } from '@aws-amplify/data-schema';
import { a } from '@aws-amplify/data-schema'; // schema builder

const schema = a.schema({
  File: a
    .model({
      id: a.id(),                 // auto-generated id
      key: a.string().required(),
      filename: a.string().required(),
      size: a.integer(),
      type: a.string(),
      uploadedAt: a.datetime(),
      owner: a.string(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;
export default defineData({ schema });
