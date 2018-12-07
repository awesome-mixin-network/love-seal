const User =require('./model/user')
const Record =require('./model/record')
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
  }
}