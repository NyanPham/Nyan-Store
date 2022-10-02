const AppError = require('../utils/appError')

const handleCastErrorDB = (err) => {
    const message = `Invalid input value of ${err.path}: ${JSON.stringify(err.value)}`
    return new AppError(message, 400)
}

const handleDuplicateErrorDB = (err) => {
    let message
    if (err.keyValue.user && err.keyValue.product) {
        message = 'The user has already reviewed the product'
    } else {
        message = `Duplicate value of ${Object.keys(err.keyValue)[0]}: ${
            Object.values(err.keyValue)[0]
        }`
    }

    return new AppError(message, 400)
}

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    })
}

const sendErrorPro = (err, res) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    }

    res.status(err.statusCode).json({
        status: err.status,
        message: 'Oops! Something went really wrong!',
    })
}

const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res)
    } else {
        let error = { ...err }
        error.code = err.code
        error.name = err.name
        error.message = err.message

        if (error.code === 11000) error = handleDuplicateErrorDB(error)
        if (error.name === 'CastError') error = handleCastErrorDB(error)

        sendErrorPro(error, res)
    }
}

module.exports = globalErrorHandler
