const Product = require('../models/productModel')
const AppError = require('../utils/appError')
const APIFeatures = require('../utils/apiFeatures')

const catchAsync = require('../utils/catchAsync')

exports.getAllProducts = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Product.find(), req.query)
    features.find().sort().limitFields().paginate()

    const products = await features.query

    res.status(200).json({
        status: 'success',
        results: products.length,
        data: {
            products,
        },
    })
})

exports.createProducts = catchAsync(async (req, res, next) => {
    const newProduct = await Product.create(req.body)

    if (newProduct == null) {
        return next(new AppError('No new product created', 400))
    }

    res.status(201).json({
        status: 'success',
        data: {
            product: newProduct,
        },
    })
})

exports.getProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id)

    if (product == null) {
        return next(new AppError('No product found with that ID', 400))
    }

    res.status(200).json({
        status: 'success',
        data: {
            product,
        },
    })
})

exports.updateProduct = catchAsync(async (req, res, next) => {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })

    if (updatedProduct == null) {
        return next(new AppError('No product updated with that ID', 400))
    }

    res.status(200).json({
        status: 'success',
        data: {
            product: updatedProduct,
        },
    })
})

exports.deleteProduct = catchAsync(async (req, res, next) => {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id)

    if (deletedProduct == null) {
        return next(new AppError('No product deleted with that ID', 400))
    }

    res.status(204).json({
        status: 'success',
        data: null,
    })
})
