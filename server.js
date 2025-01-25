const express = require('express'); // Import the express module
const connectDB = require('./config/db'); // Import the DB connection module

// Create an express application
const app = express();

// Connect to mongodb database
connectDB();

// Init middleware
app.use(express.json({ extended: false }));

// Define route handlers
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// Define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

// Start the express server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
