const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/settings', systemController.getSystemSettings);
router.post('/settings', authenticateToken, authorizeRoles('Admin', 'Manager'), systemController.updateSystemSettings);

module.exports = router;
