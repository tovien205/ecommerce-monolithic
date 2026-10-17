const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Khai báo các endpoints CRUD theo đúng yêu cầu Bước 10
router.post('/', productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:pid', productController.getProductById);
router.put('/:pid', productController.updateProduct);
router.delete('/:pid', productController.deleteProduct);

module.exports = router;