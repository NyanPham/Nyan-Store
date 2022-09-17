const mongoose = require('mongoose')
const Product = require('../models/productModel')
const Variant = require('../models/variantModel')
const AppError = require('../utils/appError')
const APIFeatures = require('../utils/apiFeatures')
const factory = require('./factoryHandler')
const catchAsync = require('../utils/catchAsync')

const getSortQuery = (sortTerm) => {
    switch (sortTerm) {
        case 'oldest':
            return 'createdAt'
        case 'latest':
            return '-createdAt'
        case 'price-up':
            return 'price'
        case 'price-down':
            return '-price'
        case 'alphabet':
            return 'name'
        default:
            return ''
    }
}

const createSearchRegexQuery = (searchRegex) => {
    return [
        {
            name: searchRegex,
        },
        {
            vendor: searchRegex,
        },
        {
            tags: searchRegex,
        },
        {
            SKU: searchRegex,
        },
    ]
}

const filterOptionsIfAny = (options, allOptions) => {
    return options?.length ? options : allOptions || []
}

exports.getCollectionAndCategoryIds = (req, res, next) => {
    if (req.params.collectionId) req.body.collectionId = req.params.collectionId
    if (req.params.categoryId) req.body.categoryId = req.params.categoryId

    next()
}

exports.filterProducts = catchAsync(async (req, res, next) => {
    const {
        size,
        color,
        material,
        brand,
        maxPrice,
        minPrice,
        sortByTerm,
        categoryId,
        emptyCategory,
        searchTerm,
        categoryName,
    } = req.body.filterQuery
    const { allSize, allColor, allMaterial, allBrand } = req.body.all
    const searchRegexObj = {
        $regex: searchTerm ? `^${searchTerm}` : '',
        $options: 'mix',
    }

    const variantIds = await Variant.aggregate([
        {
            $match: {
                option1: {
                    $in: filterOptionsIfAny(size, allSize),
                },
                option2: {
                    $in: filterOptionsIfAny(color, allColor),
                },
                option3: {
                    $in: filterOptionsIfAny(material, allMaterial),
                },
                price: {
                    $gte: minPrice,
                    $lte: maxPrice,
                },
            },
        },
        {
            $project: {
                _id: 1,
            },
        },
    ])

    const productFilterQuery = {
        category: categoryId,
        variants: {
            $in: variantIds,
        },
        vendor: {
            $in: filterOptionsIfAny(brand, allBrand),
        },
        $or: createSearchRegexQuery(searchRegexObj),
    }

    if (categoryName.toLowerCase() === 'all') delete productFilterQuery['category']

    const products = await Product.find(productFilterQuery).sort(getSortQuery(sortByTerm))

    res.status(200).json({
        status: 'success',
        results: products.length,
        data: {
            docs: products,
        },
    })
})

exports.getFilterFacets = catchAsync(async (req, res, next) => {
    // const variantOptionFacets = Variant.aggregate([
    //     {
    //         $facet: {
    //             size: APIFeatures.createFacetsQuery('option1'),
    //             color: APIFeatures.createFacetsQuery('option2'),
    //             material: APIFeatures.createFacetsQuery('option3'),
    //             maxPrice: APIFeatures.createMaxMinPriceFacetQuery(-1),
    //             minPrice: APIFeatures.createMaxMinPriceFacetQuery(1),
    //         },
    //     },
    // ])

    const productAggregation = [
        {
            $lookup: {
                from: 'variants',
                let: { variant_ids: '$variants', vendor: '$vendor' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ['$_id', '$$variant_ids'],
                            },
                        },
                    },
                    {
                        $facet: {
                            size: APIFeatures.createFacetsQuery('option1'),
                            color: APIFeatures.createFacetsQuery('option2'),
                            material: APIFeatures.createFacetsQuery('option3'),
                            maxPrice: APIFeatures.createMaxMinPriceFacetQuery(-1),
                            minPrice: APIFeatures.createMaxMinPriceFacetQuery(1),
                            brands: [
                                {
                                    $group: {
                                        _id: '$$vendor',
                                    },
                                },
                                {
                                    $addFields: {
                                        value: '$_id',
                                    },
                                },
                                {
                                    $project: {
                                        value: 1,
                                        _id: 0,
                                    },
                                },
                            ],
                        },
                    },
                ],
                as: 'facets',
            },
        },
        {
            $project: {
                facets: {
                    $first: '$facets',
                },
            },
        },
        {
            $unwind: '$facets.size',
        },
        {
            $unwind: '$facets.color',
        },
        {
            $unwind: '$facets.material',
        },
        {
            $unwind: '$facets.brands',
        },
        {
            $group: {
                _id: null,
                size: {
                    $addToSet: '$facets.size',
                },
                color: {
                    $addToSet: '$facets.color',
                },
                material: {
                    $addToSet: '$facets.material',
                },
                maxPrice: {
                    $max: '$facets.maxPrice.value',
                },
                minPrice: {
                    $min: '$facets.minPrice.value',
                },
                brands: {
                    $addToSet: '$facets.brands',
                },
            },
        },
    ]

    if (req.query.category != null)
        productAggregation.unshift({
            $match: {
                $expr: {
                    $eq: ['$category', { $toObjectId: req.query.category }],
                },
            },
        })

    const productGeneralFacets = await Product.aggregate(productAggregation)

    // console.log(productGeneralFacets[0].facets[0].size)

    // const facets = await Promise.all([variantOptionFacets, productGeneralFacets])

    res.status(200).json({
        status: 'success',
        data: {
            facets: productGeneralFacets,
        },
    })
})

exports.getProductFromSlug = catchAsync(async (req, res, next) => {
    const tour = await Product.findOne({ slug: req.params.slug })

    res.status(200).json({
        status: 'success',
        data: {
            doc: tour,
        },
    })
})

exports.getAllProducts = factory.getAll(Product)
exports.createProducts = factory.createOne(Product)
exports.getProduct = factory.getOne(Product)
exports.updateProduct = factory.updateOne(Product)
exports.deleteProduct = factory.deleteOne(Product)
