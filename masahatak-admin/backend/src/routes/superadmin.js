const express = require('express');
const router = express.Router();
const superadminController = require('../controllers/superadminController');
const authMiddleware = require('../middleware/auth');
const superAdminAuth = require('../middleware/superAdminAuth');

router.use(authMiddleware);

// User management
router.get('/users', superadminController.listUsers);
router.post('/users/:uid/suspend', superadminController.suspendUser);
router.post('/users/:uid/unsuspend', superadminController.unsuspendUser);

// Admin management - restricted to super_admin only
router.get('/admins', superAdminAuth, superadminController.listAdmins);
router.get('/admins/:id', superadminController.getAdminById);
router.post('/admins', superAdminAuth, superadminController.createAdmin);
router.put('/admins/:uid/role', superAdminAuth, superadminController.updateAdminRole);
router.delete('/admins/:uid', superAdminAuth, superadminController.removeAdmin);

// Audit logs - restricted to super_admin only
router.get('/audit-logs', superAdminAuth, superadminController.getAuditLogs);

module.exports = router;
