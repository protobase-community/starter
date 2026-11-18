import { createServer, type AddressInfo } from 'node:net'

// A mail server for tests: it takes every message over plain SMTP, keeps none of it but the last message's text, and
// sends nothing on. Enough for the app's mailer to deliver a sign-up code that a test then reads.

export const startMailSink = async () => {
  const messages: string[] = []
  const server = createServer((socket) => {
    let buffer = ''
    let inData = false
    socket.write('220 sink ESMTP\r\n')
    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8')
      for (;;) {
        if (inData) {
          const end = buffer.indexOf('\r\n.\r\n')
          if (end === -1) return
          messages.push(buffer.slice(0, end))
          buffer = buffer.slice(end + 5)
          inData = false
          socket.write('250 OK\r\n')
          continue
        }
        const end = buffer.indexOf('\r\n')
        if (end === -1) return
        const command = buffer.slice(0, end).toUpperCase()
        buffer = buffer.slice(end + 2)
        if (command.startsWith('DATA')) {
          inData = true
          socket.write('354 End data with <CR><LF>.<CR><LF>\r\n')
        } else if (command.startsWith('QUIT')) {
          socket.end('221 Bye\r\n')
          return
        } else socket.write('250 OK\r\n')
      }
    })
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address() as AddressInfo
  return {
    url: `smtp://127.0.0.1:${port}?requireTLS=false`,
    messages,
    close: () => new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))),
  }
}
