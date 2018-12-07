const Koa = require('koa')
const views = require('koa-views')
const path = require('path')
const serve = require('koa-static')
const bodyParser = require('koa-bodyparser')
const session = require('koa-session')
const passport = require('koa-passport')
const db = require('./db')
const route = require('./route')
const conf = require('./config.json')

const app = new Koa()

// body parser
app.use(bodyParser())

// Sessions
app.keys = ['secret']
app.use(session({}, app))

require('./auth')
// Passport
app.use(passport.initialize())
app.use(passport.session())

// logger
app.use(async function (ctx, next) {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// static file and views template
app.use(serve('./assets/'))
app.use(views(path.join(__dirname, './views/'), {
  extension: 'jade',
  map: {
    html: 'underscore'
  },
  options: {
    helpers: {
      uppercase: (str) => str.toUpperCase()
    },
    partials: {
    }
  }
}))

// route
route.init(app)

// db
db.testDb()

// serve
app.listen(conf.port)
