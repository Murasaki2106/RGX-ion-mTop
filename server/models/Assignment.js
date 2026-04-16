const mongoose = require('mongoose');

const SubmittedFileSchema = new mongoose.Schema({
  name: String,
  size: String
});

const AssignmentSchema = new mongoose.Schema({
  id: Number,
  title: String,
  course: String,
  faculty: String,
  dueDate: Date,
  assignedDate: Date,
  status: { type: String, default: 'active' }, // just 'active' or 'expired'
  description: String,
  instructions: String,
  maxMarks: Number
});

module.exports = mongoose.model('Assignment', AssignmentSchema);
