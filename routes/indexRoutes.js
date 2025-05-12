const express = require('express');
const router = express.Router();
const Product = require('../models/product');

router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ status: 'approved' }).limit(10).sort({ createdAt: -1 });
    res.render('index', { title: 'Homepage', products, message: null });
  } catch (err) {
    console.error(err);
    res.render('index', { title: 'Homepage', products: [], message: 'Error loading products' });
  }
});

module.exports = router;