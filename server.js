const dotenv = require('dotenv')
const mongoose = require('mongoose')

const app = require('./app')

dotenv.config({ path: `${__dirname}/config.env` })
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB).then(() => console.log('Database is successfully connected!'))

process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! Shutting down server...')
    console.log(err.message)
    server.close(() => {
        process.exit(1)
    })
})

const port = process.env.PORT || 3000
const server = app.listen(port, () => {
    console.log(`App is running at port ${port}`)
})

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! Shutting down server...')
    console.log(err.message)
    server.close(() => {
        process.exit(1)
    })
})
