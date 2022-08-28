const Collection = require('../models/collectionModel')
const factory = require('./factoryHandler')

exports.getAllCollections = factory.getAll(Collection)
exports.createCollection = factory.createOne(Collection)
exports.getCollection = factory.getOne(Collection)
exports.updateCollection = factory.updateOne(Collection)
exports.deleteCollection = factory.deleteOne(Collection)
