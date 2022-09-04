const dotenv = require('dotenv')
const mongoose = require('mongoose')

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! Shutting down server...')
    console.log(err.message)
    server.close(() => {
        process.exit(1)
    })
})

dotenv.config({ path: `./config.env` })
const app = require('./app')

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB).then(() => console.log('Database is successfully connected!'))

const port = process.env.PORT || 8080
const server = app.listen(port, () => {
    console.log(`App is running at port ${port}`)
})

process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! Shutting down server...')
    console.log(err.message)
    server.close(() => {
        process.exit(1)
    })
})

process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully...')
    server.close(() => {
        console.log('Process terminated!')
    })
})
