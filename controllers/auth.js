const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

// Add om a cpmstamt fpr the number of rounds
const saltRounds = 12;

// All routes go here

router.post('/sign-up', async (req, res) => {
    try {
        // Check if the username is already taken
        const userInDatabase = await User.findOne({ username: req.body.username });

        if (userInDatabase) {
            return res.status(409).json({ err: 'Username already taken' });
        }

        // Create a new user with hashed password
        const user = await User.create({
            username: req.body.username,
            hashedPassword: bcrypt.hashSync(req.body.password, saltRounds)
        })

        // Construct the payload
        const payload = { username: user.username, _id: user._id, points:0};

        // CCreate the token, attaching the payload
        const token = jwt.sign({ payload }, process.env.JWT_SECRET);

        res.status(201).json({ token });

    } catch (err) {
        // Send the error message to the client
        res.status(500).json({ err: err.message });

    }
})

router.post('/sign-in', async (req, res) => {
    try {
        // Look up the user by their username in the database
        const user = await User.findOne({ username: req.body.username });

        if (!user) {
            return res.status(401).json({ err: 'Invalid Credentials' });
        }

        // Check if the password is correct using bcrypt
        const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.hashedPassword);

        // If the password is incorrect, return a 401 status
        if (!isPasswordCorrect) {
            return res.status(401).json({ err: 'Invalid Credentials!' });
        }

        // Construct the payload 
        const payload = { username: user.username, _id: user._id, points:user.points }

        // Create the token, attaching the payload
        const token = jwt.sign( { payload }, process.env.JWT_SECRET);

        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
})

module.exports = router;