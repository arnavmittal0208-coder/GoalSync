const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'], required: true },
  year: { type: Number, required: true },
  achievement: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['not-started', 'on-track', 'completed', 'at-risk'], 
    default: 'not-started' 
  },
  notes: { type: String, default: '' },
  managerComment: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
}, { timestamps: true });

checkInSchema.index({ goalId: 1, employeeId: 1, quarter: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('CheckIn', checkInSchema);
