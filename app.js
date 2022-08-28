const express = require('express')
const AppError = require('./utils/appError')

const globalErrorHandler = require('./controllers/errorController')
const productRouter = require('./routes/productRoutes')

const app = express()

// Transfer data to process
app.use(express.json({ limit: '10kb' }))

// Routes
app.use('/api/v1/products', productRouter)

app.use('*', (req, res, next) => {
    next(new AppError(`No routes found at ${req.originalUrl}`, 400))
})

// Error hanlder
app.use(globalErrorHandler)

module.exports = app
