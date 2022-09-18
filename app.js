const path = require('path')
const express = require('express')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const hpp = require('hpp')
const cors = require('cors')
const compression = require('compression')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const productRouter = require('./routes/productRoutes')
const userRouter = require('./routes/userRoutes')
const collectionRouter = require('./routes/collectionRoutes')
const categoryRouter = require('./routes/categoryRoutes')
const auctionRouter = require('./routes/auctionRoutes')
const orderRouter = require('./routes/orderRoutes')
const couponRouter = require('./routes/couponRoutes')
const countryRouter = require('./routes/countryRoutes')
const variantRouter = require('./routes/variantRoutes')

const app = express()

app.enable('trust proxy')

// Security
app.use(
    cors({
        origin: [
            'https://elaborate-chimera-ea1e59.netlify.app',
            'http://localhost:8080',
            'https://main--elaborate-chimera-ea1e59.netlify.app',
        ],
        credentials: true,
    })
)

app.options(
    '*',
    cors({
        origin: [
            'https://elaborate-chimera-ea1e59.netlify.app',
            'http://localhost:8080',
            'https://main--elaborate-chimera-ea1e59.netlify.app',
        ],
        credentials: true,
    })
)

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100000,
    message: 'You have reached the maximum query limit. Please wait for 15 minutes...',
})

app.use(helmet())
app.use(limiter)
app.use(mongoSanitize())
app.use(xss())
app.use(
    hpp({
        whitelist: [
            'name',
            'vendor',
            'variants',
            'SKU',
            'slug',
            'maxPrice',
            'minPrice',
            'categories',
            'collections',
            'tags',
            'inventory',
            'bidding',
        ],
    })
)

// Serve
app.use(express.static(path.join(__dirname, 'public')))

// Transfer data to process
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

app.use(compression())

// Routes
app.use('/api/v1/products', productRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/collections', collectionRouter)
app.use('/api/v1/categories', categoryRouter)
app.use('/api/v1/bidding', auctionRouter)
app.use('/api/v1/orders', orderRouter)
app.use('/api/v1/coupons', couponRouter)
app.use('/api/v1/countries', countryRouter)
app.use('/api/v1/variants', variantRouter)

app.use('*', (req, res, next) => {
    next(new AppError(`No routes found at ${req.originalUrl}`, 400))
})

// Error hanlder
app.use(globalErrorHandler)

module.exports = app
