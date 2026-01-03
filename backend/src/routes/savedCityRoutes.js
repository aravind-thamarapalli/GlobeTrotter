const express = require('express');
const router = express.Router();
const savedCityController = require('../controllers/savedCityController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken); // Protection

router.get('/', savedCityController.getSavedCities);
router.post('/', savedCityController.saveCity);
router.delete('/:cityId', savedCityController.unsaveCity);

module.exports = router;
