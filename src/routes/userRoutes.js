const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Route bảo mật lấy thông tin cá nhân kèm Membership
router.get('/profile', authenticateToken, userController.getUserProfile);

module.exports = router;