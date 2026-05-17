const User = require('../models/User');
const Goal = require('../models/Goal');
const CheckIn = require('../models/CheckIn');
const AuditLog = require('../models/AuditLog');

// @desc    Get all users (Admin)
// @route   GET /api/users
const getUsers = async (req, res, next) => {
  try {
    const { role, department, isActive } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    const users = await User.find(filter).populate('managerId', 'name email').sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) { next(error); }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('managerId', 'name email designation');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (error) { next(error); }
};

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, department, designation, managerId, isActive, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, { name, email, role, department, designation, managerId, isActive, phone },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (error) { next(error); }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = false;
    await user.save();
    res.status(200).json({ success: true, message: 'User deactivated' });
  } catch (error) { next(error); }
};

// @desc    Get managers list
// @route   GET /api/users/managers
const getManagers = async (req, res, next) => {
  try {
    const managers = await User.find({ role: 'manager', isActive: true }).select('name email department designation avatar');
    res.status(200).json({ success: true, managers });
  } catch (error) { next(error); }
};

// @desc    Get team members for manager
// @route   GET /api/users/team
const getTeamMembers = async (req, res, next) => {
  try {
    const members = await User.find({ managerId: req.user._id, isActive: true })
      .select('name email department designation avatar joinDate lastLogin');
    res.status(200).json({ success: true, count: members.length, members });
  } catch (error) { next(error); }
};

// @desc    Get analytics data (Admin)
// @route   GET /api/users/analytics
const getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalGoals = await Goal.countDocuments();
    const approvedGoals = await Goal.countDocuments({ status: 'approved' });
    const pendingGoals = await Goal.countDocuments({ status: 'submitted' });
    const completedCheckIns = await CheckIn.countDocuments({ status: 'completed' });
    const byDept = await User.aggregate([
      { $match: { isActive: true, role: 'employee' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const goalsByStatus = await Goal.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const checkInsByQuarter = await CheckIn.aggregate([
      { $group: { _id: '$quarter', count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
      { $sort: { _id: 1 } }
    ]);
    res.status(200).json({
      success: true,
      analytics: { totalUsers, totalGoals, approvedGoals, pendingGoals, completedCheckIns, byDept, goalsByStatus, checkInsByQuarter }
    });
  } catch (error) { next(error); }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser, getManagers, getTeamMembers, getAnalytics };
