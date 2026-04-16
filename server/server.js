const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import Models
const UserProfile = require('./models/UserProfile');
const Course = require('./models/Course');
const Assignment = require('./models/Assignment');
const ExamResult = require('./models/ExamResult');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = 'mongodb://127.0.0.1:27017/rgx_ion_mtop';

app.use(cors());
app.use(express.json());

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB via Mongoose.'))
  .catch(err => console.error('Failed to connect to MongoDB', err));


// Routes
app.get('/api/dashboard', async (req, res) => {
  try {
    const user = await UserProfile.findOne({});
    const recentAssignments = await Assignment.find({}).sort({ dueDate: 1 }).limit(2).select('id title course dueDate status');
    const enrolledCourses = await Course.countDocuments({});

    res.json({
      user,
      recentAssignments,
      enrolledCourses
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/assignments', async (req, res) => {
  try {
    const assignments = await Assignment.find({})
      .select('id title course faculty dueDate status maxMarks marksReceived submittedAt');
    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/assignments/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ id: parseInt(req.params.id) });
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json({ assignment });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/assignments/:id/submit', async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ id: parseInt(req.params.id) });
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    
    assignment.status = 'completed';
    assignment.submittedAt = new Date().toISOString();
    if (req.body.files) {
      assignment.submittedFiles = req.body.files;
    }
    
    await assignment.save();
    res.json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find({});
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/profile', async (req, res) => {
  try {
    const profile = await UserProfile.findOne({});
    const totalCourses = await Course.countDocuments({});
    res.json({ profile, totalCourses });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/results', async (req, res) => {
  try {
    const examResultsDocs = await ExamResult.find({});
    const profile = await UserProfile.findOne({}).select('cgpa');
    
    // Group back to the object structure the frontend expects
    const results = {};
    const semesters = [];
    
    // Sort array by semester name for ordered list, e.g. "Semester 1", "Semester 2"
    examResultsDocs.sort((a, b) => a.semester.localeCompare(b.semester));

    examResultsDocs.forEach(doc => {
      semesters.push(doc.semester);
      results[doc.semester] = {
        sgpa: doc.sgpa,
        subjects: doc.subjects
      };
    });

    res.json({ semesters, results, cgpa: profile ? profile.cgpa : 0 });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
