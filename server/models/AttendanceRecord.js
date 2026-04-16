const mongoose = require('mongoose');

const AttendanceRecordSchema = new mongoose.Schema({
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  courseId: { type: Number, required: true },
  studentEmail: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Absent'], required: true },
  markedBy: { type: String, required: true } // Professor's email
});

// Compound index to ensure 1 attendance record per student per course per day
AttendanceRecordSchema.index({ date: 1, courseId: 1, studentEmail: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceRecord', AttendanceRecordSchema);
