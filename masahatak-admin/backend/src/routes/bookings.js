const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookingsController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', bookingsController.getAllBookings);
router.get('/:id', bookingsController.getBookingById);
router.put('/:id/cancel', bookingsController.cancelBooking);

module.exports = router;
