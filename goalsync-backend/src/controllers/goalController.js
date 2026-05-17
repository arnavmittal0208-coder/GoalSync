const Goal = require('../models/Goal');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

const createNotification = async (userId, type, title, message, relatedId = null) => {
  try {
    await Notification.create({ userId, type, title, message, relatedId });
  } catch (e) { console.error('Notification error:', e.message); }
};

const createAuditLog = async (action, entity, entityId, userId, oldValue, newValue) => {
  try {
    await AuditLog.create({ action, entity, entityId, userId, oldValue, newValue });
  } catch (e) { console.error('Audit log error:', e.message); }
};

// @desc    Get all goals for current employee
// @route   GET /api/goals
const getMyGoals = async (req, res, next) => {
  try {
    const { status, year } = req.query;
    const filter = { owner: req.user._id };
    if (status) filter.status = status;
    if (year) filter.year = parseInt(year);
    const goals = await Goal.find(filter).populate('approvedBy rejectedBy lockedBy', 'name email').sort('-createdAt');
    res.status(200).json({ success: true, count: goals.length, goals });
  } catch (error) { next(error); }
};

// @desc    Create a goal
// @route   POST /api/goals
const createGoal = async (req, res, next) => {
  try {
    const { title, description, unit, target, weightage, cycleId } = req.body;
    // Check max 8 goals per employee per year
    const currentYear = new Date().getFullYear();
    const goalCount = await Goal.countDocuments({ owner: req.user._id, year: currentYear });
    if (goalCount >= 8) {
      return res.status(400).json({ success: false, message: 'Maximum 8 goals allowed per year' });
    }
    if (weightage < 10) {
      return res.status(400).json({ success: false, message: 'Minimum weightage per goal is 10%' });
    }
    const goal = await Goal.create({ title, description, unit, target, weightage, owner: req.user._id, cycleId, year: currentYear });
    await createAuditLog('CREATE', 'Goal', goal._id, req.user._id, null, goal.toObject());
    res.status(201).json({ success: true, goal });
  } catch (error) { next(error); }
};

// @desc    Update a goal (draft only)
// @route   PUT /api/goals/:id
const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    if (goal.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (goal.isLocked) {
      return res.status(400).json({ success: false, message: 'Goal is locked. Contact Admin to unlock.' });
    }
    if (goal.isShared) {
      // Shared goals: only weightage can be changed
      const oldValue = goal.toObject();
      goal.weightage = req.body.weightage || goal.weightage;
      await goal.save();
      await createAuditLog('UPDATE', 'Goal', goal._id, req.user._id, oldValue, goal.toObject());
      return res.status(200).json({ success: true, goal });
    }
    const oldValue = goal.toObject();
    const allowedFields = ['title', 'description', 'unit', 'target', 'weightage'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) goal[field] = req.body[field];
    });
    await goal.save();
    await createAuditLog('UPDATE', 'Goal', goal._id, req.user._id, oldValue, goal.toObject());
    res.status(200).json({ success: true, goal });
  } catch (error) { next(error); }
};

// @desc    Delete a draft goal
// @route   DELETE /api/goals/:id
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    if (goal.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (goal.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft goals can be deleted' });
    }
    await createAuditLog('DELETE', 'Goal', goal._id, req.user._id, goal.toObject(), null);
    await goal.deleteOne();
    res.status(200).json({ success: true, message: 'Goal deleted' });
  } catch (error) { next(error); }
};

// @desc    Submit goals for approval (validates total weightage = 100%)
// @route   POST /api/goals/submit
const submitGoals = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const draftGoals = await Goal.find({ owner: req.user._id, status: 'draft', year: currentYear });
    if (draftGoals.length === 0) {
      return res.status(400).json({ success: false, message: 'No draft goals to submit' });
    }
    const totalWeightage = draftGoals.reduce((sum, g) => sum + g.weightage, 0);
    if (totalWeightage !== 100) {
      return res.status(400).json({ 
        success: false, 
        message: `Total weightage must be exactly 100%. Current: ${totalWeightage}%` 
      });
    }
    await Goal.updateMany({ owner: req.user._id, status: 'draft', year: currentYear }, { status: 'submitted' });
    // Notify manager
    const employee = await User.findById(req.user._id);
    if (employee.managerId) {
      await createNotification(
        employee.managerId, 
        'goal_submitted', 
        'Goals Submitted for Review',
        `${employee.name} has submitted ${draftGoals.length} goals for your approval.`,
        req.user._id
      );
    }
    res.status(200).json({ success: true, message: `${draftGoals.length} goals submitted for approval` });
  } catch (error) { next(error); }
};

// @desc    Get team goals (Manager)
// @route   GET /api/goals/team
const getTeamGoals = async (req, res, next) => {
  try {
    const teamMembers = await User.find({ managerId: req.user._id }).select('_id');
    const memberIds = teamMembers.map(m => m._id);
    const goals = await Goal.find({ owner: { $in: memberIds } })
      .populate('owner', 'name email department designation avatar')
      .populate('approvedBy rejectedBy', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: goals.length, goals });
  } catch (error) { next(error); }
};

// @desc    Approve a goal (Manager)
// @route   PUT /api/goals/:id/approve
const approveGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id).populate('owner', 'name email managerId');
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    if (goal.status !== 'submitted') {
      return res.status(400).json({ success: false, message: 'Goal must be in submitted status to approve' });
    }
    const oldValue = goal.toObject();
    goal.status = 'approved';
    goal.isLocked = true;
    goal.approvedBy = req.user._id;
    goal.managerComment = req.body.comment || '';
    if (req.body.target) goal.target = req.body.target;
    if (req.body.weightage) goal.weightage = req.body.weightage;
    await goal.save();
    await createNotification(
      goal.owner._id, 'goal_approved', 'Goal Approved! 🎉',
      `Your goal "${goal.title}" has been approved by your manager.`, goal._id
    );
    await createAuditLog('APPROVE', 'Goal', goal._id, req.user._id, oldValue, goal.toObject());
    res.status(200).json({ success: true, goal });
  } catch (error) { next(error); }
};

// @desc    Reject a goal (Manager)
// @route   PUT /api/goals/:id/reject
const rejectGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id).populate('owner', 'name email');
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    const oldValue = goal.toObject();
    goal.status = 'rejected';
    goal.rejectedBy = req.user._id;
    goal.managerComment = req.body.comment || '';
    await goal.save();
    await createNotification(
      goal.owner._id, 'goal_rejected', 'Goal Needs Revision',
      `Your goal "${goal.title}" was returned for revision. Comment: ${goal.managerComment}`, goal._id
    );
    await createAuditLog('REJECT', 'Goal', goal._id, req.user._id, oldValue, goal.toObject());
    // Reset to draft so employee can edit
    goal.status = 'draft';
    goal.rejectedBy = req.user._id;
    await goal.save();
    res.status(200).json({ success: true, goal });
  } catch (error) { next(error); }
};

// @desc    Admin: Unlock goal
// @route   PUT /api/goals/:id/unlock
const unlockGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    const oldValue = goal.toObject();
    goal.isLocked = false;
    goal.status = 'approved';
    goal.lockedBy = req.user._id;
    await goal.save();
    await createNotification(
      goal.owner, 'goal_unlocked', 'Goal Unlocked',
      `Your goal "${goal.title}" has been unlocked by Admin.`, goal._id
    );
    await createAuditLog('UNLOCK', 'Goal', goal._id, req.user._id, oldValue, goal.toObject());
    res.status(200).json({ success: true, goal });
  } catch (error) { next(error); }
};

// @desc    Create shared goal (Manager/Admin)
// @route   POST /api/goals/shared
const createSharedGoal = async (req, res, next) => {
  try {
    const { title, description, unit, target, employeeIds, cycleId } = req.body;
    const sharedGoals = [];
    for (const empId of employeeIds) {
      const goal = await Goal.create({
        title, description, unit, target,
        weightage: 10, // default, employee can change
        owner: empId,
        isShared: true,
        sharedWith: employeeIds.filter(id => id !== empId),
        cycleId,
        year: new Date().getFullYear(),
      });
      sharedGoals.push(goal);
      await createNotification(empId, 'shared_goal', 'Shared Goal Assigned',
        `A shared team goal "${title}" has been assigned to you.`, goal._id);
    }
    res.status(201).json({ success: true, count: sharedGoals.length, goals: sharedGoals });
  } catch (error) { next(error); }
};

// @desc    Get all goals (Admin)
// @route   GET /api/goals/all
const getAllGoals = async (req, res, next) => {
  try {
    const { status, year, department } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (year) filter.year = parseInt(year);
    let goals = await Goal.find(filter)
      .populate('owner', 'name email department designation avatar')
      .populate('approvedBy rejectedBy', 'name')
      .sort('-createdAt');
    if (department) {
      goals = goals.filter(g => g.owner && g.owner.department === department);
    }
    res.status(200).json({ success: true, count: goals.length, goals });
  } catch (error) { next(error); }
};

// @desc    Get single goal
// @route   GET /api/goals/:id
const getGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id)
      .populate('owner approvedBy rejectedBy lockedBy', 'name email avatar designation');
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.status(200).json({ success: true, goal });
  } catch (error) { next(error); }
};

module.exports = { getMyGoals, createGoal, updateGoal, deleteGoal, submitGoals, getTeamGoals, approveGoal, rejectGoal, unlockGoal, createSharedGoal, getAllGoals, getGoal };
