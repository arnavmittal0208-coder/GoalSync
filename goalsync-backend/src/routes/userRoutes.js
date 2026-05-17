const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getUsers, getUserById, updateUser, deleteUser, getManagers, getTeamMembers, getAnalytics } = require('../controllers/userController');

router.get('/', protect, authorize('admin'), getUsers);
router.get('/managers', protect, getManagers);
router.get('/team', protect, authorize('manager', 'admin'), getTeamMembers);
router.get('/analytics', protect, authorize('admin', 'manager'), getAnalytics);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
