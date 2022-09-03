const Variant = require('../models/variantModel')
const factory = require('../controllers/factoryHandler')

exports.getAllVariants = factory.getAll(Variant)
exports.createVariant = factory.createOne(Variant)
exports.getVariant = factory.getOne(Variant)
exports.updateVariant = factory.updateOne(Variant)
exports.deleteVariant = factory.deleteOne(Variant)
