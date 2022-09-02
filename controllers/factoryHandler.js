const catchAsync = require('../utils/catchAsync')
const APIFeatures = require('../utils/apiFeatures')
const AppError = require('../utils/appError')

const constructQueryFilter = (obj) => {
    const { collectionId, categoryId, user, product } = obj
    const filterObj = {}

    if (collectionId) {
        filterObj.collections = {
            $in: collectionId,
        }
    }

    if (categoryId) {
        filterObj.category = categoryId
    }

    if (user) {
        filterObj.user = user
    }

    if (product) {
        filterObj.product = product
    }

    return filterObj
}

exports.getAll = (Model) => {
    return catchAsync(async (req, res, next) => {
        const filterObj = constructQueryFilter(req.body)

        const features = new APIFeatures(Model.find(filterObj), req.query)
        features.find().sort().limitFields().paginate()

        const docs = await features.query

        res.status(200).json({
            status: 'success',
            results: docs.length,
            data: {
                docs,
            },
        })
    })
}

exports.createOne = (Model) => {
    return catchAsync(async (req, res, next) => {
        const newDoc = await Model.create(req.body)

        if (newDoc == null) {
            return next(new AppError('No document created', 400))
        }

        res.status(201).json({
            status: 'success',
            data: {
                doc: newDoc,
            },
        })
    })
}

exports.getOne = (Model, populateObject = null) => {
    return catchAsync(async (req, res, next) => {
        const query = Model.findById(req.params.id)

        if (populateObject != null) {
            query.populate(populateObject)
        }

        const doc = await query

        if (doc == null) {
            return next(new AppError('No document found with that ID', 400))
        }

        res.status(200).json({
            status: 'success',
            data: {
                doc,
            },
        })
    })
}

exports.updateOne = (Model) => {
    return catchAsync(async (req, res, next) => {
        const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        if (updatedDoc == null) {
            return next(new AppError('No document updated with that ID', 400))
        }

        res.status(200).json({
            status: 'success',
            data: {
                doc: updatedDoc,
            },
        })
    })
}

exports.deleteOne = (Model) => {
    return catchAsync(async (req, res, next) => {
        const deletedDoc = await Model.findByIdAndDelete(req.params.id)

        if (deletedDoc == null) {
            return next(new AppError('No document deleted with that ID', 400))
        }

        res.status(200).json({
            status: 'success',
            data: null,
        })
    })
}
