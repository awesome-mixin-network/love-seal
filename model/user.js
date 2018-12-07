const Sequelize = require('sequelize')
const db = require('../db')
const Record = require('./record')

const User = db.getDB().define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  f1dbId: {
    type: Sequelize.STRING
  },
  twitterId: {
    type: Sequelize.STRING
  },
  createdAt: {
    type: Sequelize.TIME
  },
  updatedAt: {
    type: Sequelize.TIME
  }
})

User.hasMany(Record, {as: 'Creator', foreignKey: 'creatorId'})
Record.belongsTo(User, {foreignKey: 'creatorId'})

module.exports = User
