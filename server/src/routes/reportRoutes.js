const express = require('express');
const router = express.Router();
const { getReportData } = require('../controllers/reportController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/data', authenticateToken, authorizeRoles('admin', 'manager'), getReportData);

module.exports = router;
