import { type ClientSchema, a, defineData } from '@aws-amplify/backend'

/*== STEP 1 ===============================================================
Define Todo model with content + isDone fields.
Authorization: allow public API key *and* owner-based access.
=========================================================================*/
const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
      isDone: a.boolean().default(false), // new field
    })
    .authorization((allow) => [
      allow.publicApiKey(), // anyone with API key can CRUD
      allow.owner(),        // owners can manage their own items
    ]),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
})
