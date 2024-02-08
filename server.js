// Import the Express module
const express = require('express');

// Create an Express application
const app = express();

// Define route handlers
app.get('/', (req, res) => {
	res.send('Hello, Express!');
});

// Start the Express server
const PORT = process.env.PORT || 3000; // looks for open port in Heroku and port 5000 locally
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
