const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getMyCheckIns, upsertCheckIn, addManagerComment, getTeamCheckIns, getAllCheckIns } = require('../controllers/checkInController');

router.get('/', protect, getMyCheckIns);
router.post('/', protect, authorize('employee'), upsertCheckIn);
router.put('/:id/comment', protect, authorize('manager', 'admin'), addManagerComment);
router.get('/team', protect, authorize('manager', 'admin'), getTeamCheckIns);
router.get('/all', protect, authorize('admin'), getAllCheckIns);

module.exports = router;
