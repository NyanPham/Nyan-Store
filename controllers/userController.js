const factory = require('../controllers/factoryHandler')
const User = require('../models/userModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

const filterAllowedFields = (obj, ...allowedFields) => {
    return allowedFields.reduce((filteredObj, field) => {
        if (obj[field] != null) {
            filteredObj[field] = obj[field]
        }

        return filteredObj
    }, {})
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user._id

    next()
}

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('Password cannot be updated at this route. Please use /updatePassword instead', 403))
    }

    const filteredFields = filterAllowedFields(req.body, 'name', 'email', 'address', 'phone')

    const user = await User.findByIdAndUpdate(req.user._id, filteredFields, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, { active: false })

    res.status(204).json({
        status: 'success',
        data: null,
    })
})

exports.getAllUsers = factory.getAll(User)
exports.getUser = factory.getOne(User)
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)
