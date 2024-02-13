const mongoose = require('mongoose'); // this package is the ORM for interacting with MongoDB
const config = require('config'); // this package allows you to create global values in a central file (default.js) to be used throughout your app

const db = config.get('mongoURI'); // config package automatically gets mongoURI from default.json file

// establish connection with MongoDB database
const connectDB = async () => {
	// using try/catch in case DB connection fails to get helpful error message
	try {
		await mongoose.connect(db); // returns a promise so we need to await it
		console.log('MongoDB Connected...');
	} catch (err) {
		console.error(err.message);
		process.exit(1);
	}
};

module.exports = connectDB;
