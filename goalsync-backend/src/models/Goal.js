const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  unit: { 
    type: String, 
    enum: ['numeric', 'percentage', 'timeline', 'zero-based'], 
    required: true 
  },
  target: { type: Number, required: true },
  weightage: { type: Number, required: true, min: 10, max: 100 },
  status: { 
    type: String, 
    enum: ['draft', 'submitted', 'approved', 'rejected', 'locked'], 
    default: 'draft' 
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isShared: { type: Boolean, default: false },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isLocked: { type: Boolean, default: false },
  lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  managerComment: { type: String, default: '' },
  cycleId: { type: mongoose.Schema.Types.ObjectId, ref: 'GoalCycle', default: null },
  year: { type: Number, default: () => new Date().getFullYear() },
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
