const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isNotBanned } = require('../middleware/authMiddleware');
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);
router.get('/login', authController.getLogin);
router.post('/login', isNotBanned, authController.postLogin);
router.get('/logout', authController.logout);

module.exports = router;