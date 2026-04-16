const mongoose = require('mongoose');

const SubmittedFileSchema = new mongoose.Schema({
  name: String,
  size: String,
  type: String,
  dataUrl: String
});

const SubmissionSchema = new mongoose.Schema({
  assignmentId: Number,
  studentEmail: String,
  studentName: String,
  status: { type: String, default: "pending" }, // 'pending', 'completed'
  submittedAt: { type: Date, default: null },
  submittedFiles: [SubmittedFileSchema],
  marksReceived: { type: Number, default: null },
  feedback: { type: String, default: null }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
