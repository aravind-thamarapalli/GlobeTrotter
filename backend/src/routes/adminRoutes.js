const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(authenticateToken);
router.use(adminMiddleware);

router.get('/stats', adminController.getStats);

module.exports = router;
