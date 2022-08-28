const Category = require('../models/categoryModel')
const factory = require('./factoryHandler')

exports.getAllCategories = factory.getAll(Category)
exports.createCategory = factory.createOne(Category)
exports.getCategory = factory.getOne(Category)
exports.updateCategory = factory.updateOne(Category)
exports.deleteCategory = factory.deleteOne(Category)
