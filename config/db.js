const mongoose = require('mongoose')
require('dotenv').config()

const db = process.env.MONGO_URI

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    })
    console.log('MongoDB connnected...')
  } catch (error) {
    console.error(error.message)
    // exit process with failure
    process.exit(1)
  }
}

module.exports = connectDB