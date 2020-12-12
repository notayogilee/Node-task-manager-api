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

app.get('/', (req, res) => {
  res.send('Main page')
})

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});