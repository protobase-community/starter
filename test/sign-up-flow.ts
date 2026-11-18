// Open sign-up as the sign-in page walks it: the address, then the code mailed to it, then the name and password.
// `origin` is the app's URL, which the auth endpoints check requests against.

type Sink = { messages: string[] }

const post = (url: string, origin: string, path: string, body: object) =>
  fetch(`${url}/api/auth${path}`, { method: 'POST', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify(body) })

export const sendSignUpCode = (url: string, origin: string, email: string) => post(url, origin, '/sign-up/send-code', { email })

// The code of the last message to `email`, which the subject names; mail goes out after the answer, so it waits a little.
const mailedCode = async (sink: Sink, email: string) => {
  for (let tries = 0; tries < 40; tries++) {
    const message = sink.messages.findLast((text) => text.includes(`To: ${email}`))
    const code = message?.match(/^Subject: \D*(\d{6})/m)?.[1]
    if (code) return code
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`No sign-up code reached ${email}`)
}

/** Signs `email` up and answers the new account and a bearer token for it. */
export const signUp = async (url: string, origin: string, sink: Sink, email: string) => {
  const sent = await sendSignUpCode(url, origin, email)
  if (!sent.ok) throw new Error(`Sending the code answered ${sent.status}`)
  const verified = await post(url, origin, '/sign-up/verify-code', { email, code: await mailedCode(sink, email) })
  const { ticket } = (await verified.json()) as { ticket: string }
  const created = await post(url, origin, '/sign-up/create', { ticket, name: 'Colleague', password: 'a-password-for-this-test-only' })
  if (!created.ok) throw new Error(`Making the account answered ${created.status}`)
  const { user } = (await created.json()) as { user: { email: string; role: string } }
  const cookie = created.headers.getSetCookie().map((header) => header.split(';')[0]).join('; ')
  const { token } = (await (await fetch(`${url}/api/auth/token`, { headers: { cookie, origin } })).json()) as { token: string }
  return { user, token }
}
