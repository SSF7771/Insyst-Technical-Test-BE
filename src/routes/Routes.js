const express = require('express');
const router = express.Router();
const productController = require('../controllers/Controller');
const upload = require('../middlewares/upload');

// Read
router.get('/', productController.getAllProducts);

// Create (with Image)
router.post('/', upload.single('image'), productController.createProduct);

// Update (with Image)
router.put('/:id', upload.single('image'), productController.updateProduct);

// Delete
router.delete('/:id', productController.deleteProduct);

module.exports = router;