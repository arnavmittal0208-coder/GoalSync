const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getReportData, getAuditLogs } = require('../controllers/reportController');
const { getCycles, createCycle, updateCycle, deleteCycle } = require('../controllers/cycleController');

router.get('/', protect, authorize('admin', 'manager'), getReportData);
router.get('/audit', protect, authorize('admin'), getAuditLogs);

// Goal Cycles
router.get('/cycles', protect, getCycles);
router.post('/cycles', protect, authorize('admin'), createCycle);
router.put('/cycles/:id', protect, authorize('admin'), updateCycle);
router.delete('/cycles/:id', protect, authorize('admin'), deleteCycle);

module.exports = router;
