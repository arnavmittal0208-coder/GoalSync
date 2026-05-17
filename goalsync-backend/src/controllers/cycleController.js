const GoalCycle = require('../models/GoalCycle');

// @desc    Get all goal cycles
const getCycles = async (req, res, next) => {
  try {
    const cycles = await GoalCycle.find().populate('createdBy', 'name').sort('-year -createdAt');
    res.status(200).json({ success: true, cycles });
  } catch (error) { next(error); }
};

// @desc    Create goal cycle
const createCycle = async (req, res, next) => {
  try {
    const cycle = await GoalCycle.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, cycle });
  } catch (error) { next(error); }
};

// @desc    Update cycle (set active)
const updateCycle = async (req, res, next) => {
  try {
    if (req.body.isActive) {
      await GoalCycle.updateMany({}, { isActive: false });
    }
    const cycle = await GoalCycle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cycle) return res.status(404).json({ success: false, message: 'Cycle not found' });
    res.status(200).json({ success: true, cycle });
  } catch (error) { next(error); }
};

// @desc    Delete cycle
const deleteCycle = async (req, res, next) => {
  try {
    await GoalCycle.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Cycle deleted' });
  } catch (error) { next(error); }
};

module.exports = { getCycles, createCycle, updateCycle, deleteCycle };
