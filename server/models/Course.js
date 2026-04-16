const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  id: Number,
  name: String,
  code: String,
  faculty: String,
  attendance: Number,
  nextClass: String
});

module.exports = mongoose.model('Course', CourseSchema);
