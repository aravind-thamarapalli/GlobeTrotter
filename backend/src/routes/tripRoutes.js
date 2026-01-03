const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const stopController = require('../controllers/stopController'); // Need to create this
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken); // Protect all trip routes

const { upload } = require('../middleware/uploadMiddleware');

router.post('/', upload.single('cover_photo'), tripController.createTrip);
router.get('/', tripController.getTrips);
router.get('/:id', tripController.getTripById);
router.patch('/:id', tripController.updateTrip); // Placeholder
router.delete('/:id', tripController.deleteTrip);
router.patch('/:id/make-public', tripController.makePublic);
router.get('/:id/budget', tripController.getTripBudget);

// Stops Sub-routes
// POST /api/trips/:id/stops
router.post('/:id/stops', stopController.addStop);
router.patch('/:id/stops', stopController.reorderStops); // Reorder all stops? "PATCH /reorder" maybe clearer but spec says PATCH /trips/:id/stops

module.exports = router;
