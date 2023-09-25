const mongoose = require('mongoose');

// Connect to MongoDB database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

// Get the database connection status
const db = mongoose.connection;

// Connection error handling
db.on('error', () => {
  console.log('mongodb error!');
});

// Connection success handling
db.once('open', () => {
  console.log('mongodb connected!');
});

module.exports = db;