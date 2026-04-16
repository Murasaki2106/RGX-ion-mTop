const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  name: String,
  role: String,
  avatar: String,
  overallAttendance: Number,
  tasksPending: Number,
  notifications: Number,
  regNumber: String,
  email: String,
  department: String,
  semester: String,
  section: String,
  batch: String,
  cgpa: Number,
  phone: String,
  dob: String,
  bloodGroup: String,
  address: String,
  fatherName: String,
  motherName: String,
  advisor: String
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);
