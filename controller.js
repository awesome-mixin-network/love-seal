const passport = require('koa-passport')
const User = require('./model/user')
const Record = require('./model/record')
const f1db = require('./f1db')
const cache = require('./cache')
const conf = require('./config.json')

module.exports = {
  index: async function (ctx) {
    let records = await Record.findAll({ limit: 50, order: [['createdAt', 'DESC']] })
    records = records.map((x) => {
      return x.toJSON()
    })
    for (let i = 0; i < records.length; i++) {
      records[i].creator = await cache.getUserMust(records[i].creatorId)
    }
    ctx.state.items = records
    await ctx.render('index')
  },
  
  single: async function (ctx) {
    let id = ctx.params.id
    let record = await cache.getRecordMust(id)
    record.creator = await cache.getUserMust(record.creatorId)
    ctx.state.item = record
    await ctx.render('single')
  }, 
  
  create: async function (ctx) {
    let user = ctx.state.user
    let quota = await cache.getQuotaMust(user.id, true)
    ctx.state.insufficient = false
    if (Math.floor(quota.balance / parseFloat(quota.quota_amount))< 0.0000001) {
      ctx.state.insufficient = true
    }
    await ctx.render('create')
  },

  handleCreate: async function (ctx) {
    let createData = ctx.request.body
    let user = ctx.state.user
    // validated
    if (createData.content.length === 0) {
      ctx.state.message = ("Invalid content")
      await ctx.render('error')
      return 
    }
    let content = createData.content
    var resp, contentId, snapshotId
    // 0. check quota
    try {
      let quota = await cache.getQuotaMust(user.id, true)
      if (Math.floor(quota.balance / parseFloat(quota.quota_amount))< 0.0000001) {
        ctx.state.message = ("Insufficient quota")
        await ctx.render('error')
        return
      }
    } catch (e) {
      ctx.state.message = ("handleCreate(getAssets): " + e.message)
      await ctx.render('error')
      return
    }
    // 1. create a item
    try {
      resp = await f1db.createRecord(user.f1dbId, content)
      contentId = resp.data.cid
    } catch (e) {
      ctx.state.message = ("handleCreate(createRecord): " + e.message)
      await ctx.render('error')
      return
    }
    // 2. keep the item
    try {
      resp2 = await f1db.keepRecord(user.f1dbId, contentId)
      snapshotId = resp2.data.snapshot_id
    } catch (e) {
      ctx.state.message = ("handleCreate(keepRecord): " + e.message)
      await ctx.render('error')
      return
    }
    // 3. insert into db
    let item = await Record.create({ 
      creatorId: user.id,
      contentId: contentId,
      snapshotId: snapshotId,
      text: createData.content,
    })
    ctx.state.item = item.get({plain: true})
    ctx.state.item.creator = user.get({plain: true})
    await ctx.render('single')
  },

  // user
  singleUser: async function (ctx) {
    let uid = ctx.params.uid
    // this user
    let targetUser = await cache.getUserMust(uid)
    // their items
    let records = await Record.findAll({ limit: 50, order: [['createdAt', 'DESC']], where: { 'creatorId': uid } })
    records = records.map((x) => {
      x = x.toJSON()
      x.creator = targetUser
      return x
    })
    ctx.state.targetUser = targetUser
    let quota = await cache.getQuotaMust(uid, true)
    ctx.state.quotaCount = Math.floor(quota.balance / parseFloat(quota.quota_amount))
    ctx.state.quotaAddress = quota.public_key
    ctx.state.quotaAmount = quota.quota_amount
    // console.log(quota)
    ctx.state.items = records
    await ctx.render('user')
  },

  // user auth
  login: async function (ctx) {
    await ctx.render('login')
  },

  logout: async function (ctx) {
    await ctx.logout()
    ctx.redirect('/')
  },

  authTwitter: async function (ctx) {
    await passport.authenticate('twitter')(ctx)
  },
  
  authTwitterCallback: async function (ctx) {
    await passport.authenticate('twitter', { failureRedirect: '/login' },
      function(req, res) {
        // Successful authentication, redirect home.
        // console.log(req, res)
        ctx.login(res)
        ctx.redirect('/')
      })(ctx)
  },
}
