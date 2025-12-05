const express = require('express');
const router = express.Router();
const productRoutes = require('./Routes');

router.use('/products', productRoutes);

module.exports = router;