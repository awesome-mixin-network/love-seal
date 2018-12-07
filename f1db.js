const axios = require('axios')
const conf = require('./config.json')

module.exports = {
  request: function (opts) {
    return new Promise((resolve, reject) => {
      axios.request({
        method: opts.method,
        url: conf.f1db_gateway + opts.url,
        data: opts.data,
        headers: opts.headers
      }).then((resp) => {
        if (resp && resp.data) {
          return resolve(resp.data)
        } else {
          return resolve(resp)
        }
      }).catch((err) => {
        console.log('request error:', err)
        return reject(err)
      })
    })
  },
  formAuthHeaders: function (userId) {
    return {
      '-x-user-id': userId, 
    }
  },
  register: function () {
    return this.request({
      method: 'POST',
      url: '/register'
    })
  },
  login: function (userId) {
    return this.request({
      method: 'POST',
      url: '/login',
      data: {
        'id': userId,
      }
    })
  },
  createRecord: function (userId, content) {
    return this.request({
      method: 'POST',
      url: '/records',
      headers: this.formAuthHeaders(userId),
      data: {
        'type': 'text/plain',
        'content': content
      }
    })
  },
  keepRecord: function (userId, cid) {
    return this.request({
      method: 'POST',
      url: '/records/' + cid + '/keep',
      headers: this.formAuthHeaders(userId),
      data: {}
    })
  }
}
