const express = require('express');
const router = express.Router();
const providersController = require('../controllers/providersController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', providersController.getAllProviders);
router.get('/:id', providersController.getProviderById);
router.put('/:id/status', providersController.updateProviderStatus);
router.delete('/:id', providersController.deleteProvider);

module.exports = router;
