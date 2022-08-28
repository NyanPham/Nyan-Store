const express = require('express')
const cookieParser = require('cookie-parser')
const AppError = require('./utils/appError')

const globalErrorHandler = require('./controllers/errorController')
const productRouter = require('./routes/productRoutes')
const userRouter = require('./routes/userRoutes')
const collectionRouter = require('./routes/collectionRoutes')
const categoryRouter = require('./routes/categoryRoutes')
const biddingRouter = require('./routes/biddingRoutes')

const app = express()

// Transfer data to process
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

// Routes
app.use('/api/v1/products', productRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/collections', collectionRouter)
app.use('/api/v1/categories', categoryRouter)
app.use('/api/v1/bidding', biddingRouter)

app.use('*', (req, res, next) => {
    next(new AppError(`No routes found at ${req.originalUrl}`, 400))
})

// Error hanlder
app.use(globalErrorHandler)

module.exports = app
