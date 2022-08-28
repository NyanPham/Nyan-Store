const express = require('express')
const cookieParser = require('cookie-parser')
const AppError = require('./utils/appError')

const globalErrorHandler = require('./controllers/errorController')
const productRouter = require('./routes/productRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()

// Transfer data to process
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

// Routes
app.use('/api/v1/products', productRouter)
app.use('/api/v1/users', userRouter)

app.use('*', (req, res, next) => {
    next(new AppError(`No routes found at ${req.originalUrl}`, 400))
})

// Error hanlder
app.use(globalErrorHandler)

module.exports = app
