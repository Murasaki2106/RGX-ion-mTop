const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userEmail: { type: String, required: true }, // The user who receives the notification
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String }, // 'assignment_created', 'submission_made', etc.
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
