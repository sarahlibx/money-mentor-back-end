const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');

//auth and users
const authRouter = require('./controllers/auth');
const usersRouter = require('./controllers/users');
const transactionsRoutes = require('./controllers/transactions');
const categoriesRoutes = require('./controllers/categories');

//database
mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

//middleware
app.use(cors());
app.use(express.json());
app.use(logger('dev'));

// Routes go here
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/transactions', transactionsRoutes);
app.use('/categories', categoriesRoutes);

//server
app.listen(3000, () => {
  console.log('The express app is ready!');
});
