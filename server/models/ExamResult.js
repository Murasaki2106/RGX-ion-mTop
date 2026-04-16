const mongoose = require('mongoose');

const SubjectResultSchema = new mongoose.Schema({
  code: String,
  name: String,
  credits: Number,
  grade: String,
  gradePoint: Number
});

const ExamResultSchema = new mongoose.Schema({
  semester: String,
  sgpa: Number,
  subjects: [SubjectResultSchema]
});

module.exports = mongoose.model('ExamResult', ExamResultSchema);
