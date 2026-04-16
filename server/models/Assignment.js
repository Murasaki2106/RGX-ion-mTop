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
  status: String,
  description: String,
  instructions: String,
  maxMarks: Number,
  marksReceived: { type: Number, default: null },
  submittedAt: { type: Date, default: null },
  submittedFiles: [SubmittedFileSchema],
  feedback: { type: String, default: null }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);
