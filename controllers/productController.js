const Product = require('../models/productModel')
const AppError = require('../utils/appError')
const APIFeatures = require('../utils/apiFeatures')
const factory = require('./factoryHandler')
const catchAsync = require('../utils/catchAsync')

exports.getCollectionAndCategoryIds = (req, res, next) => {
    if (req.params.collectionId) req.body.collectionId = req.params.collectionId
    if (req.params.categoryId) req.body.categoryId = req.params.categoryId

    next()
}

exports.getAllProducts = factory.getAll(Product)
exports.createProducts = factory.createOne(Product)
exports.getProduct = factory.getOne(Product)
exports.updateProduct = factory.updateOne(Product)
exports.deleteProduct = factory.deleteOne(Product)

exports.getFilterFacets = catchAsync(async (req, res, next) => {
    const facetOne = Product.aggregate([
        {
            $facet: {
                sizes: [
                    {
                        $unwind: '$variants',
                    },
                    {
                        $group: {
                            _id: '$variants.option1',
                            variants: { $push: '$variants._id' },
                        },
                    },
                    {
                        $addFields: {
                            value: '$_id',
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                        },
                    },
                ],
                colors: [
                    {
                        $unwind: '$variants',
                    },
                    {
                        $group: {
                            _id: '$variants.option2',
                            variants: { $push: '$variants._id' },
                        },
                    },
                    {
                        $addFields: {
                            value: '$_id',
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                        },
                    },
                ],
                materials: [
                    {
                        $unwind: '$variants',
                    },
                    {
                        $group: {
                            _id: '$variants.option3',
                            variants: { $push: '$variants._id' },
                        },
                    },
                    {
                        $addFields: {
                            value: '$_id',
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                        },
                    },
                ],
                brands: [
                    {
                        $group: {
                            _id: '$vendor',
                        },
                    },
                    {
                        $addFields: {
                            value: '$_id',
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                        },
                    },
                ],
            },
        },
    ])

    // const facetTwo = Product.aggregate([
    //     {
    //         $unwind: '$variants',
    //     },
    //     {
    //         $group: {
    //             _id: '$variants.option2',
    //             variants: { $push: '$variants._id' },
    //         },
    //     },
    //     {
    //         $addFields: {
    //             color: '$_id',
    //         },
    //     },
    //     {
    //         $project: {
    //             _id: 0,
    //         },
    //     },
    // ])

    // const facetThree = Product.aggregate([
    //     {
    //         $unwind: '$variants',
    //     },
    //     {
    //         $group: {
    //             _id: '$variants.option3',
    //             variants: { $push: '$variants._id' },
    //         },
    //     },
    //     {
    //         $addFields: {
    //             material: '$_id',
    //         },
    //     },
    //     {
    //         $project: {
    //             _id: 0,
    //         },
    //     },
    // ])

    const facets = await Promise.all([facetOne])

    res.status(200).json({
        status: 'success',
        data: {
            facets,
        },
    })
})
