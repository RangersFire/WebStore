const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isLoggedIn, isAdmin, isNotBanned } = require('../middleware/authMiddleware');
const methodOverride = require('method-override');
router.use(methodOverride('_method')); 
router.get('/dashboard', isLoggedIn, isAdmin, isNotBanned, adminController.getAdminDashboard);
router.get('/products-approval', isLoggedIn, isAdmin, isNotBanned, adminController.getProductsForApproval);
router.put('/products/:id/approve', isLoggedIn, isAdmin, isNotBanned, adminController.approveProduct);
router.put('/products/:id/reject', isLoggedIn, isAdmin, isNotBanned, adminController.rejectProduct);
router.get('/users', isLoggedIn, isAdmin, isNotBanned, adminController.getAllUsers);
router.put('/users/:id/ban', isLoggedIn, isAdmin, isNotBanned, adminController.banUser);
router.put('/users/:id/unban', isLoggedIn, isAdmin, isNotBanned, adminController.unbanUser);

module.exports = router;