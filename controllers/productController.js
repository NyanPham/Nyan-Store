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
        skip,
        limit,
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
    const categoryToQuery = categoryId && categoryName !== 'all' ? categoryId : '*'

    console.log(getSortQuery(sortByTerm))

    const products = await Product.find({
        category: categoryToQuery,
        variants: {
            $in: variantIds,
        },
        vendor: {
            $in: filterOptionsIfAny(brand, allBrand),
        },
        $or: createSearchRegexQuery(searchRegexObj),
    }).sort(getSortQuery(sortByTerm))

    res.status(200).json({
        status: 'success',
        results: products.length,
        data: {
            docs: products,
        },
    })
})

exports.getFilterFacets = catchAsync(async (req, res, next) => {
    const variantOptionFacets = Variant.aggregate([
        {
            $facet: {
                size: APIFeatures.createFacetsQuery('option1'),
                color: APIFeatures.createFacetsQuery('option2'),
                material: APIFeatures.createFacetsQuery('option3'),
                maxPrice: APIFeatures.createMaxMinPriceFacetQuery(-1),
                minPrice: APIFeatures.createMaxMinPriceFacetQuery(1),
            },
        },
    ])

    const productGeneralFacets = Product.aggregate([
        {
            $facet: {
                brand: APIFeatures.createFacetsQuery('vendor'),
            },
        },
    ])

    const facets = await Promise.all([variantOptionFacets, productGeneralFacets])

    res.status(200).json({
        status: 'success',
        data: {
            facets,
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
