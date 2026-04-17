const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import Models
const UserProfile = require('./models/UserProfile');
const Course = require('./models/Course');
const Assignment = require('./models/Assignment');
const ExamResult = require('./models/ExamResult');
const Submission = require('./models/Submission');
const AttendanceRecord = require('./models/AttendanceRecord');
const Notification = require('./models/Notification');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = 'mongodb://127.0.0.1:27017/rgx_ion_mtop';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB via Mongoose.'))
  .catch(err => console.error('Failed to connect to MongoDB', err));


// -- HELPER FUNCTIONS --
async function getDynamicCourseAttendance(email, courses) {
  if (!email) return courses.map(c => c.attendance || 0);

  const fetchRecords = await AttendanceRecord.find({ studentEmail: email });
  const recordsByCourse = {};
  fetchRecords.forEach(r => {
    if (!recordsByCourse[r.courseId]) recordsByCourse[r.courseId] = [];
    recordsByCourse[r.courseId].push(r);
  });

  return courses.map(c => {
    const recs = recordsByCourse[c.id] || [];
    if (recs.length === 0) return c.attendance || 0; // Fallback
    const present = recs.filter(r => r.status === 'Present').length;
    return Math.round((present / recs.length) * 100);
  });
}

// -- AUTH -- 
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserProfile.findOne({ email, password });
    
    if (user) {
      res.json({ success: true, email: user.email, role: user.role });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// -- STUDENT DATA --
app.get('/api/dashboard', async (req, res) => {
  try {
    const email = req.query.email;
    const user = await UserProfile.findOne(email ? { email } : {});
    
    // Sort upcoming assignments by nearest due date first
    const assignments = await Assignment.find({ dueDate: { $gte: new Date() } })
                                        .sort({ dueDate: 1 })
                                        .limit(3);
    
    // Fallback if no future deadlines, show the latest created
    if (assignments.length === 0) {
      const fallback = await Assignment.find({}).sort({ assignedDate: -1, id: -1 }).limit(3);
      assignments.push(...fallback);
    }
    
    // Attach derived submission status if student
    const recentAssignments = await Promise.all(assignments.map(async (a) => {
      const sub = await Submission.findOne({ assignmentId: a.id, studentEmail: email });
      return {
        id: a.id, title: a.title, course: a.course, dueDate: a.dueDate,
        status: sub ? sub.status : 'pending'
      };
    }));

    const enrolledCourses = await Course.countDocuments({});
    
    // Compute dynamic pending tasks
    const activeAssignmentsCount = await Assignment.countDocuments({ status: 'active' });
    const completedSubmissionsCount = await Submission.countDocuments({ studentEmail: email, status: 'completed' });
    const pendingTasksCount = Math.max(0, activeAssignmentsCount - completedSubmissionsCount);

    const userObj = user ? user.toObject() : {};
    if (userObj.email) {
      userObj.tasksPending = pendingTasksCount;
      
      // Compute Overall Attendance dynamically as the exact average of individual courses
      const allCourses = await Course.find({});
      if (allCourses.length > 0) {
        const dynamicAtts = await getDynamicCourseAttendance(email, allCourses);
        const totalAttendance = dynamicAtts.reduce((sum, val) => sum + val, 0);
        const avgAttendance = totalAttendance / allCourses.length;
        userObj.overallAttendance = Math.round(avgAttendance * 10) / 10;
      } else {
        userObj.overallAttendance = 0;
      }
    }

    res.json({ user: userObj, recentAssignments, enrolledCourses });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/assignments', async (req, res) => {
  try {
    const email = req.query.email;
    const assignmentsDocs = await Assignment.find({});
    
    const assignments = await Promise.all(assignmentsDocs.map(async (a) => {
      const sub = await Submission.findOne({ assignmentId: a.id, studentEmail: email });
      return {
        id: a.id, title: a.title, course: a.course, faculty: a.faculty,
        dueDate: a.dueDate, maxMarks: a.maxMarks,
        status: sub ? sub.status : 'pending',
        marksReceived: sub ? sub.marksReceived : null,
        submittedAt: sub ? sub.submittedAt : null
      };
    }));

    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/assignments/:id', async (req, res) => {
  try {
    const email = req.query.email;
    const id = parseInt(req.params.id);
    const assignmentDoc = await Assignment.findOne({ id });
    if (!assignmentDoc) return res.status(404).json({ error: 'Assignment not found' });

    const sub = await Submission.findOne({ assignmentId: id, studentEmail: email });
    
    const assignment = {
      ...assignmentDoc.toObject(),
      status: sub ? sub.status : 'pending',
      marksReceived: sub ? sub.marksReceived : null,
      submittedAt: sub ? sub.submittedAt : null,
      submittedFiles: sub ? sub.submittedFiles : [],
      feedback: sub ? sub.feedback : null
    };

    res.json({ assignment });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/assignments/:id/submit', async (req, res) => {
  try {
    const email = req.query.email;
    const id = parseInt(req.params.id);
    if (!email) return res.status(400).json({ error: 'Email required' });

    const assignment = await Assignment.findOne({ id });
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    
    // Find the student's name
    const student = await UserProfile.findOne({ email });

    // Upsert submission
    let sub = await Submission.findOne({ assignmentId: id, studentEmail: email });
    if (!sub) {
      sub = new Submission({
        assignmentId: id,
        studentEmail: email,
        studentName: student ? student.name : 'Unknown Student'
      });
    }

    sub.status = 'completed';
    sub.submittedAt = new Date();
    if (req.body.files) {
      console.log("RECEIVED FILES PAYLOAD:", req.body.files.map(f => ({ name: f.name, hasUrl: !!f.dataUrl, type: f.type })));
      sub.submittedFiles = req.body.files;
    }
    await sub.save();
    
    // Find Professor to notify
    const profs = await UserProfile.find({ role: 'Professor' });
    const profToNotify = profs.find(p => p.name === assignment.faculty) || profs[0];
    if (profToNotify) {
      const notif = new Notification({
        userEmail: profToNotify.email,
        title: `New Submission: ${assignment.title}`,
        message: `${student ? student.name : 'A student'} has submitted the assignment for ${assignment.course}.`,
        type: 'submission_made'
      });
      await notif.save();
    }

    const updatedAssignment = {
      ...assignment.toObject(),
      status: sub.status,
      marksReceived: sub.marksReceived,
      submittedAt: sub.submittedAt,
      submittedFiles: sub.submittedFiles,
      feedback: sub.feedback
    };

    res.json({ success: true, assignment: updatedAssignment });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// -- PROFESSOR DATA --

app.get('/api/professor/assignments', async (req, res) => {
  try {
    const profName = req.query.professorName;
    if (!profName) return res.status(400).json({ error: 'professorName required' });
    
    // Fetch assignments created by this professor
    const assignments = await Assignment.find({ faculty: { $regex: profName, $options: 'i' } }).sort({ dueDate: -1 });
    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/assignments', async (req, res) => {
  try {
    const { title, course, dueDate, description, instructions, maxMarks, faculty } = req.body;
    
    // Auto-increment logic
    const lastAssignment = await Assignment.findOne().sort({ id: -1 });
    const nextId = lastAssignment ? lastAssignment.id + 1 : 1;

    const newAssignment = new Assignment({
      id: nextId,
      title,
      course,
      faculty,
      dueDate: new Date(dueDate),
      assignedDate: new Date(),
      status: 'active',
      description,
      instructions,
      maxMarks: parseInt(maxMarks) || 100
    });

    await newAssignment.save();
    
    // Fetch all students to notify
    const students = await UserProfile.find({ role: 'Student' });
    const notifications = students.map(student => ({
      userEmail: student.email,
      title: `New Assignment Create: ${title}`,
      message: `A new assignment has been posted for ${course} by ${faculty}. Due date: ${new Date(dueDate).toLocaleDateString()}`,
      type: 'assignment_created'
    }));
    await Notification.insertMany(notifications);

    res.json({ success: true, assignment: newAssignment });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/submissions', async (req, res) => {
  try {
    const profName = req.query.professorName;
    const submissions = await Submission.find({}).sort({ submittedAt: -1 });
    
    // Only fetch assignments explicitly involving this professor if profName is passed
    const queryArgs = profName ? { faculty: { $regex: profName, $options: 'i' } } : {};
    const assignments = await Assignment.find(queryArgs);

    const validAssignIds = new Set(assignments.map(a => a.id));

    const data = submissions
      .filter(sub => validAssignIds.has(sub.assignmentId))
      .map(sub => {
        const parentAssig = assignments.find(a => a.id === sub.assignmentId);
        return {
          ...sub.toObject(),
          assignmentTitle: parentAssig ? parentAssig.title : 'Unknown Assignment',
          course: parentAssig ? parentAssig.course : 'Unknown',
          maxMarks: parentAssig ? parentAssig.maxMarks : 100
        };
      });

    res.json({ submissions: data });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/submissions/:id/grade', async (req, res) => {
  try {
    const { marks } = req.body;
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    
    submission.marksReceived = marks;
    await submission.save();
    
    res.json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/students', async (req, res) => {
  try {
    const students = await UserProfile.find({ role: 'Student' })
            .select('name email regNumber department')
            .sort({ name: 1 });
    res.json({ students });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/attendance', async (req, res) => {
  try {
    const { date, courseId } = req.query;
    if (!date || !courseId) return res.status(400).json({ error: 'Date and courseId required' });
    
    const records = await AttendanceRecord.find({ date, courseId: parseInt(courseId) });
    res.json({ records });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const { date, courseId, studentEmail, status, markedBy } = req.body;
    
    let record = await AttendanceRecord.findOne({ date, courseId, studentEmail });
    if (record) {
      record.status = status;
      record.markedBy = markedBy;
      await record.save();
    } else {
      record = new AttendanceRecord({ date, courseId, studentEmail, status, markedBy });
      await record.save();
    }

    res.json({ success: true, record });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// -- GENERAL --
app.get('/api/courses', async (req, res) => {
  try {
    const email = req.query.email;
    const courses = await Course.find({});
    
    // Mix in dynamic personal attendance for the active student email
    if (email) {
      const dynamicAtts = await getDynamicCourseAttendance(email, courses);
      const computedCourses = courses.map((c, i) => ({
        ...c.toObject(),
        attendance: dynamicAtts[i]
      }));
      return res.json({ courses: computedCourses });
    }

    res.json({ courses });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/profile', async (req, res) => {
  try {
    const email = req.query.email;
    let profile = await UserProfile.findOne(email ? { email } : {});
    const courses = await Course.find({});
    
    // Inject correct global attendance
    if (profile && email) {
      profile = profile.toObject();
      if (courses.length > 0) {
        const dynamicAtts = await getDynamicCourseAttendance(email, courses);
        const totalAttendance = dynamicAtts.reduce((sum, val) => sum + val, 0);
        profile.overallAttendance = Math.round((totalAttendance / courses.length) * 10) / 10;
      }
    }

    res.json({ profile, totalCourses: courses.length });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/results', async (req, res) => {
  try {
    const email = req.query.email;
    const examResultsDocs = await ExamResult.find({});
    const profile = await UserProfile.findOne(email ? { email } : {}).select('cgpa');
    
    const results = {};
    const semesters = [];
    
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

// -- NOTIFICATIONS --
app.get('/api/notifications', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: 'Email required' });
    
    const notifications = await Notification.find({ userEmail: email }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/notifications/read', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: 'Email required' });
    
    await Notification.updateMany({ userEmail: email, read: false }, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
