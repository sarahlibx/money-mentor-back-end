const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');

//auth and users
const verifyToken = require('./middleware/verify-token');
const authRouter = require('./controllers/auth');
const usersRouter = require('./controllers/users');
const categoriesRoutes = require('./controllers/categories');
const transactionsRoutes = require('./controllers/transactions');

//routes -- let's stick to the controller for routes
// const transactionsRoutes = require('./routes/transactions.routes');
// const categoriesRoutes = require('./routes/categories.routes');
// const summaryRoutes = require('./routes/summary.routes');


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
// app.use('/summary', summaryRoutes); we don't need this one


//server
app.listen(3000, () => {
  console.log('The express app is ready!');
});
