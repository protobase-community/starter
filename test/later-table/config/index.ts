import { f, resource } from '@protobase/schema'

// A table added after sign-up opened, with no access rule of its own: config/roles.ts alone decides who reads it.
export const later_notes = resource('later_notes')
  .table('sign_up_test.later_notes')
  .fields({
    id: f.integer().readOnly().dbDefault(),
    body: f.text(),
  })
  .primaryKey((r) => r.id)
