const dotenv = require('dotenv')
const mongoose = require('mongoose')

const app = require('./app')

dotenv.config({ path: `${__dirname}/config.env` })
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB).then(() => console.log('Database is successfully connected!'))

const port = process.env.PORT || 3000
const server = app.listen(port, () => {
    console.log('Helo from the server side...')
})
