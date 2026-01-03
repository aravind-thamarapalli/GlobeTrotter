const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/:slug', publicController.getPublicTrip);
router.post('/:slug/copy', authenticateToken, publicController.copyTrip);

module.exports = router;
