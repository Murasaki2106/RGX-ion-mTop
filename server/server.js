const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Dummy Data
const userProfile = {
  name: "Alex Doe",
  role: "Student",
  avatar: "https://i.pravatar.cc/150?img=11",
  overallAttendance: 85,
  tasksPending: 3,
  notifications: 2
};

const assignments = [
  { id: 1, title: "Advanced Mathematics - Assignment 3", course: "Math 301", dueDate: "2026-04-15", status: "pending" },
  { id: 2, title: "Data Structures - Lab Record", course: "CS 202", dueDate: "2026-04-12", status: "completed" },
  { id: 3, title: "Physics Practical Reflection", course: "PHY 101", dueDate: "2026-04-18", status: "pending" },
  { id: 4, title: "Database Systems Project Phase 1", course: "CS 305", dueDate: "2026-04-20", status: "pending" },
];

const courses = [
  { id: 101, name: "Data Structures and Algorithms", code: "CS 202", faculty: "Dr. L. Smith", attendance: 88, nextClass: "10:30 AM" },
  { id: 102, name: "Advanced Mathematics", code: "Math 301", faculty: "Prof. E. Brown", attendance: 76, nextClass: "12:00 PM" },
  { id: 103, name: "Database Systems", code: "CS 305", faculty: "Dr. J. Doe", attendance: 92, nextClass: "02:00 PM" },
  { id: 104, name: "Physics for Engineers", code: "PHY 101", faculty: "Dr. A. Carter", attendance: 85, nextClass: "Tomorrow" },
];

// Routes
app.get('/api/dashboard', (req, res) => {
  res.json({
    user: userProfile,
    recentAssignments: assignments.slice(0, 2),
    enrolledCourses: courses.length
  });
});

app.get('/api/assignments', (req, res) => {
  res.json({ assignments });
});

app.get('/api/courses', (req, res) => {
  res.json({ courses });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
