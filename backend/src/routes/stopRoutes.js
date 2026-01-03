const express = require('express');
const router = express.Router();
const stopController = require('../controllers/stopController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

// POST /api/stops/:id/activities
router.post('/:id/activities', stopController.addActivity);
router.delete('/:stopId', stopController.deleteStop);

module.exports = router;
