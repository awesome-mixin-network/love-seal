const Router = require('koa-router')
const controller = require('./controller')

let router = new Router();

function authRequired(ctx, next) {
  if (ctx.isAuthenticated()) {
    return next()
  } else {
    ctx.redirect('/login')
  }
}

module.exports = {
  init: function (app) {
    app.use(async function (ctx, next) {
      ctx.state.title = 'Love Seal - etch your love on the blockchain permanently'
      await next()
    })
    router
      .get('/', controller.index)
      // auth
      .get('/login', controller.login)
      .get('/logout', controller.logout)
      .get('/auth/twitter', controller.authTwitter)
      .get('/auth/twitter/callback', controller.authTwitterCallback)
      // 
      .get('/s/:id', controller.single)
      .get('/create', authRequired, controller.create)
      .post('/create', authRequired, controller.handleCreate)
      .get('/u/:uid', controller.singleUser)
      //
      .get('/hello', (ctx) => {
        ctx.body = 'Hello World'
      })
    app.use(router.routes())
  }
}
