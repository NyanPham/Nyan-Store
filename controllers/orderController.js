const Order = require('../models/orderModel')
const factory = require('./factoryHandler')

exports.getUserId = (req, res, next) => {
    if (req.params.userId) req.body.user = req.params.userId

    const parsedUrl = req.originalUrl.split('/')

    if (parsedUrl[parsedUrl.length - 1].startsWith('my')) {
        req.body.user = req.user._id
    }

    next()
}

exports.getAllOrders = factory.getAll(Order)
exports.createOrder = factory.createOne(Order)
exports.getOrder = factory.getOne(Order)
exports.updateOrder = factory.updateOne(Order)
exports.deleteOrder = factory.deleteOne(Order)
