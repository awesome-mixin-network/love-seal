const Sequelize = require('sequelize')
const db = require('../db')

const Record = db.getDB().define('record', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  creatorId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  contentId: {  // ipfs content id
    type: Sequelize.STRING
  },
  snapshotId: { // mixin network snapshot id
    type: Sequelize.STRING
  },
  text: {       // raw data
    type: Sequelize.STRING
  },
  createdAt: {
    type: Sequelize.TIME
  },
  updatedAt: {
    type: Sequelize.TIME
  }
})

module.exports = Record
