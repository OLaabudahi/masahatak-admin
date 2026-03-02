const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', reviewsController.getAllReviews);
router.delete('/:id', reviewsController.deleteReview);
router.put('/:id/flag', reviewsController.flagReview);

module.exports = router;
