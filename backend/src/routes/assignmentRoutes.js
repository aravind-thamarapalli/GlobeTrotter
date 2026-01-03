const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.patch('/:id', activityController.updateAssignment);
router.delete('/:id', activityController.deleteAssignment);

module.exports = router;
