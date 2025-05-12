const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isLoggedIn, isSeller, isNotBanned, isOwnerOrAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Middleware untuk upload file

router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts); // Rute untuk pencarian
router.get('/new', isLoggedIn, isSeller, isNotBanned, productController.getNewProductForm);
router.post('/', isLoggedIn, isSeller, isNotBanned, upload, productController.createProduct); // Gunakan 'upload' di sini
router.get('/:id', productController.getProductById);
router.get('/:id/edit', isLoggedIn, isOwnerOrAdmin, isNotBanned, productController.getEditProductForm); // isOwnerOrAdmin
router.put('/:id', isLoggedIn, isOwnerOrAdmin, isNotBanned, upload, productController.updateProduct); // Gunakan 'upload' dan isOwnerOrAdmin
router.delete('/:id', isLoggedIn, isOwnerOrAdmin, isNotBanned, productController.deleteProduct); // isOwnerOrAdmin

module.exports = router;