const CheckIn = require('../models/CheckIn');
const Goal = require('../models/Goal');
const Notification = require('../models/Notification');

// @desc    Get check-ins for employee's goals
// @route   GET /api/checkins
const getMyCheckIns = async (req, res, next) => {
  try {
    const { year, quarter } = req.query;
    const goals = await Goal.find({ owner: req.user._id, status: 'approved' });
    const goalIds = goals.map(g => g._id);
    const filter = { goalId: { $in: goalIds }, employeeId: req.user._id };
    if (year) filter.year = parseInt(year);
    if (quarter) filter.quarter = quarter;
    const checkIns = await CheckIn.find(filter).populate('goalId', 'title unit target weightage').sort('-createdAt');
    res.status(200).json({ success: true, checkIns });
  } catch (error) { next(error); }
};

// @desc    Create or update a check-in
// @route   POST /api/checkins
const upsertCheckIn = async (req, res, next) => {
  try {
    const { goalId, quarter, year, achievement, status, notes } = req.body;
    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    if (goal.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const checkIn = await CheckIn.findOneAndUpdate(
      { goalId, employeeId: req.user._id, quarter, year },
      { achievement, status, notes },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({ success: true, checkIn });
  } catch (error) { next(error); }
};

// @desc    Manager: Add comment to check-in
// @route   PUT /api/checkins/:id/comment
const addManagerComment = async (req, res, next) => {
  try {
    const checkIn = await CheckIn.findById(req.params.id).populate('goalId', 'title');
    if (!checkIn) return res.status(404).json({ success: false, message: 'Check-in not found' });
    checkIn.managerComment = req.body.comment;
    checkIn.reviewedBy = req.user._id;
    checkIn.reviewedAt = Date.now();
    await checkIn.save();
    // Notify employee
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: checkIn.employeeId,
      type: 'system',
      title: 'Manager Feedback Received',
      message: `Your manager reviewed your ${checkIn.quarter} check-in for "${checkIn.goalId.title}".`,
      relatedId: checkIn._id,
    });
    res.status(200).json({ success: true, checkIn });
  } catch (error) { next(error); }
};

// @desc    Manager: Get team check-ins
// @route   GET /api/checkins/team
const getTeamCheckIns = async (req, res, next) => {
  try {
    const { quarter, year } = req.query;
    const User = require('../models/User');
    const teamMembers = await User.find({ managerId: req.user._id }).select('_id');
    const memberIds = teamMembers.map(m => m._id);
    const filter = { employeeId: { $in: memberIds } };
    if (quarter) filter.quarter = quarter;
    if (year) filter.year = parseInt(year);
    const checkIns = await CheckIn.find(filter)
      .populate('goalId', 'title unit target weightage')
      .populate('employeeId', 'name email avatar designation department')
      .populate('reviewedBy', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, checkIns });
  } catch (error) { next(error); }
};

// @desc    Admin: Get all check-ins
// @route   GET /api/checkins/all
const getAllCheckIns = async (req, res, next) => {
  try {
    const { quarter, year } = req.query;
    const filter = {};
    if (quarter) filter.quarter = quarter;
    if (year) filter.year = parseInt(year);
    const checkIns = await CheckIn.find(filter)
      .populate('goalId', 'title unit target weightage')
      .populate('employeeId', 'name email avatar designation department')
      .populate('reviewedBy', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, checkIns });
  } catch (error) { next(error); }
};

module.exports = { getMyCheckIns, upsertCheckIn, addManagerComment, getTeamCheckIns, getAllCheckIns };
