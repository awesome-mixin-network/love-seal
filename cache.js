const User =require('./model/user')
const Record =require('./model/record')
const f1db =require('./f1db')

var caches = {}
module.exports = {
  get: function (name, key) {
    if (!caches.hasOwnProperty(name)) {
      caches[name] = {}
      return null
    }    
    return caches[name].hasOwnProperty(key) ? caches[name][key] : null
  },
  set: function (name, key, val) {
    if (!caches.hasOwnProperty(name)) {
      caches[name] = {}
    }
    return caches[name][key] = val
  },
  getUserMust: async function (uid) {
    let ret = this.get('user', uid)
    if (ret === null) {
      ret = (await User.findByPk(uid)).toJSON()
      this.set('user', uid, ret)
    }
    return ret
  },
  getRecordMust: async function (id) {
    let ret = this.get('record', id)
    if (ret === null) {
      ret = (await Record.findByPk(id)).toJSON()
      this.set('record', id, ret)
    }
    return ret
  },
  getQuotaMust: async function (uid, refresh) {
    let ret = this.get('quota', uid)
    if (ret === null || refresh === true) {
      let user = await this.getUserMust(uid)
      let resp = await f1db.quota(user.f1dbId)
      let quota = resp.data.quota
      this.set('quota', uid, quota)
      return quota
    }
    return ret
  }
}