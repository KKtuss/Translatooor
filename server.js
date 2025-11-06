const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

let server = null

app.prepare().then(() => {
  server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  server.listen(port, hostname, (err) => {
    if (err) {
      console.error('Failed to start server:', err)
      process.exit(1)
    }
    console.log(`> Ready on http://${hostname}:${port}`)
  })

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server')
    if (server) {
      server.close(() => {
        console.log('HTTP server closed')
        process.exit(0)
      })
    }
  })

  process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server')
    if (server) {
      server.close(() => {
        console.log('HTTP server closed')
        process.exit(0)
      })
    }
  })
}).catch((err) => {
  console.error('Failed to prepare Next.js app:', err)
  process.exit(1)
})

