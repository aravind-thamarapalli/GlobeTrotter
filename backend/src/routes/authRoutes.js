const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getMe);
router.delete('/me', authenticateToken, authController.deleteAccount);
router.patch('/me', authenticateToken, authController.updateProfile);

module.exports = router;
