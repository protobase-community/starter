import { defineRoles } from '@protobase/schema'

// What each role may do. With roles, an operation without a rule of its own needs the matching capability, so a
// resource added later is closed to `member` until it is listed here, such as `'customers.read'`.
export const roles = defineRoles({
  admin: ['*'],
  member: [],
})
