import { execFileSync } from 'node:child_process'

// Runs a protobase command in this project, as its scripts do, with the environment given, and answers its output; a
// failure throws.
export const protobase = (env: NodeJS.ProcessEnv, ...args: string[]) =>
  execFileSync('node_modules/.bin/protobase', args, { env, encoding: 'utf8' })
