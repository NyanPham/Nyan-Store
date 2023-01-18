const redis = require('redis')
const dotenv = require('dotenv')
dotenv.config({ path: '../config.env' })

const client = redis.createClient(process.env.REDIS_URL)

module.exports = client
