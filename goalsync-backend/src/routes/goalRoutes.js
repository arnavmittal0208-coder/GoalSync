const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMyGoals, createGoal, updateGoal, deleteGoal, submitGoals,
  getTeamGoals, approveGoal, rejectGoal, unlockGoal, createSharedGoal,
  getAllGoals, getGoal
} = require('../controllers/goalController');

// Employee routes
router.get('/', protect, getMyGoals);
router.post('/', protect, authorize('employee'), createGoal);
router.post('/submit', protect, authorize('employee'), submitGoals);
router.put('/:id', protect, updateGoal);
router.delete('/:id', protect, authorize('employee'), deleteGoal);
router.get('/:id', protect, getGoal);

// Manager routes
router.get('/manager/team', protect, authorize('manager', 'admin'), getTeamGoals);
router.put('/:id/approve', protect, authorize('manager', 'admin'), approveGoal);
router.put('/:id/reject', protect, authorize('manager', 'admin'), rejectGoal);
router.post('/shared', protect, authorize('manager', 'admin'), createSharedGoal);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllGoals);
router.put('/:id/unlock', protect, authorize('admin'), unlockGoal);

module.exports = router;
