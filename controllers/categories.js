const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const verifyToken = require('../middleware/verify-token');

//predefined categories (used in dropdowns)
router.get('/', verifyToken, async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({err:err.message});
  }
});
router.post('/', verifyToken, async (req, res)=> { 
     try {
    // changing the empty create object to req.body for testing in postman 
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({err:err.message});
  }
});

module.exports = router;
