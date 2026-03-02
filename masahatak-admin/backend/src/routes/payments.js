const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');
const authMiddleware = require('../middleware/auth');

// Admin routes (protected)
router.get('/', authMiddleware, paymentsController.listPayments);
router.get('/:paymentId', authMiddleware, paymentsController.getPaymentDetails);
router.post('/intent', authMiddleware, paymentsController.createPaymentIntent);

// Webhook route (public - no auth middleware)
router.post('/webhook/:provider', paymentsController.paymentWebhook);

module.exports = router;
