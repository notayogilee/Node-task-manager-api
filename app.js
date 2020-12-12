const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config()

const app = express();

// Connect database
connectDB()

// Init middleware - body parser
app.use(express.json({ extended: false }))

// Define routes
app.use('/users', require('./routes/users'))
app.use('/tasks', require('./routes/tasks'))

module.exports = app