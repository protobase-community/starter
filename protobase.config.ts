import { defineConfig } from '@protobase/config'

// The whole app, as one object; it grows as the app does. Its resources are found in config/. Its address and secret
// are Protobase's defaults, PROTOBASE_URL and PROTOBASE_SECRET (see .env.example).
export default defineConfig({
  auth: {
    // `member`, the role of an account made without one, holds no capability until config/roles.ts gives it some.
    roles: ['admin', 'member'],
    // Open sign-up, as `member`, for the email domains the host names in PROTOBASE_SIGN_UP_DOMAINS; the empty list
    // keeps it off without them.
    signUp: { role: 'member', domains: [] },
  },
  // Every user works in tenant 1, which access rules can compare with an organization_id column.
  authenticate: { tenant: 1 },
})
