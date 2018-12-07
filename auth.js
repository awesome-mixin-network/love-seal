const passport = require('koa-passport')
const User = require('./model/user')
const f1db = require('./f1db')
const cache = require('./cache')
const conf = require('./config')

const TwitterStrategy = require('passport-twitter').Strategy

passport.use(new TwitterStrategy({
    consumerKey: conf.auth.twitter.key,
    consumerSecret:  conf.auth.twitter.secret,
    callbackURL:  conf.auth.twitter.callback
  },
  async function (token, tokenSecret, profile, done) {
    var usr = {}
    let existed = await User.findOne({
      where: {twitterId: profile.id}
    })
    if (existed) {
      await User.update({name: profile.displayName}, { where: { id: existed.id } })
      existed = existed.get({ plain: true })
      existed.name = profile.displayName
      // console.log('done 1', existed)
      done(null, existed)
    } else {
      try {
        let newReg = await f1db.register()
        usr = await User.create({ 
          name: profile.displayName,
          twitterId: profile.id,
          f1dbId: newReg.data.id,
        })
        usr = usr.get({ plain: true})
        // console.log('done 2', usr)
        cache.set('token', usr.id, { token: token, secret: tokenSecret })
        done(null, usr)
      } catch (e) {
        console.log('Auth: register or create error.', err)
        done(null, null)
      }
    }
  }
))

passport.serializeUser(function(user, done) {
  console.log('serializeUser: ', user)
  done(null, user.id)
})

passport.deserializeUser(async function(id, done) {
  // console.log('deserializeUser: ', id)
  let user = cache.get('user', id)
  if (user === null) {
    user = await User.findById(id)
    cache.set('user', id, user)
  }
  done(null, user)
})
