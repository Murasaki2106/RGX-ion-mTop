const mongoose = require('mongoose');
const UserProfile = require('./models/UserProfile');
const Course = require('./models/Course');
const Assignment = require('./models/Assignment');
const ExamResult = require('./models/ExamResult');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/rgx_ion_mtop';

const userProfileData = {
  name: "Alex Doe",
  role: "Student",
  avatar: "https://i.pravatar.cc/150?img=11",
  overallAttendance: 85,
  tasksPending: 3,
  notifications: 2,
  regNumber: "21BCE1234",
  email: "alex.doe@university.edu",
  department: "Computer Science & Engineering",
  semester: "6th Semester",
  section: "Section A",
  batch: "2021 - 2025",
  cgpa: 8.72,
  phone: "+91 98765 43210",
  dob: "2003-06-15",
  bloodGroup: "O+",
  address: "123 University Road, Chennai, TN 600001",
  fatherName: "John Doe",
  motherName: "Jane Doe",
  advisor: "Dr. R. Krishnan"
};

const coursesData = [
  { id: 101, name: "Web Technology", code: "WT", faculty: "Kamal Garg, Shivangi Mehta, Anand Singh", attendance: 88, nextClass: "10:30 AM" },
  { id: 102, name: "Web Technology Lab", code: "WT Lab", faculty: "Kamal Garg, Shivangi Mehta, Anand Singh", attendance: 90, nextClass: "02:00 PM" },
  { id: 103, name: "AI Systems", code: "AIS", faculty: "Santosh Setapathy", attendance: 82, nextClass: "11:00 AM" },
  { id: 104, name: "AI Systems Lab", code: "AIS Lab", faculty: "Santosh Setapathy", attendance: 85, nextClass: "03:00 PM" },
  { id: 105, name: "Embedded Systems", code: "ES", faculty: "Gunjan Thakur", attendance: 76, nextClass: "09:00 AM" },
  { id: 106, name: "Embedded Systems Lab", code: "ES Lab", faculty: "Gunjan Thakur", attendance: 80, nextClass: "01:00 PM" },
  { id: 107, name: "Computer Networks", code: "CN", faculty: "Nitin Singh Rajput", attendance: 92, nextClass: "10:00 AM" },
  { id: 108, name: "Computer Networks Lab", code: "CN Lab", faculty: "Nitin Singh Rajput", attendance: 88, nextClass: "04:00 PM" },
  { id: 109, name: "Machine Learning", code: "ML", faculty: "Rashmi Bhattad", attendance: 79, nextClass: "12:00 PM" },
  { id: 110, name: "Machine Learning Lab", code: "ML Lab", faculty: "Jigar Shah", attendance: 83, nextClass: "Tomorrow" },
  { id: 111, name: "Disaster Management", code: "DM", faculty: "Shobhit Chaturvedi", attendance: 91, nextClass: "11:30 AM" },
  { id: 112, name: "Industry 4.0", code: "I4.0", faculty: "Hardik Vyas", attendance: 86, nextClass: "01:30 PM" },
  { id: 113, name: "Industry 4.0 Lab", code: "I4.0 Lab", faculty: "Hardik Vyas", attendance: 84, nextClass: "Tomorrow" }
];

const assignmentsData = [
  {
    id: 1,
    title: "Web Technology - Project Phase 1",
    course: "Web Technology",
    faculty: "Kamal Garg, Shivangi Mehta, Anand Singh",
    dueDate: new Date("2026-04-18T23:59:00"),
    assignedDate: new Date("2026-04-05T10:00:00"),
    status: "pending",
    description: "Build a responsive student portal using HTML, CSS, and JavaScript. The portal should include a login page, dashboard, and at least 3 functional pages.",
    instructions: "1. Use semantic HTML5 elements\n2. Implement responsive design with CSS Grid/Flexbox\n3. Add form validation using JavaScript\n4. Submit as a ZIP file with all source files\n5. Include a README with setup instructions",
    maxMarks: 50,
    marksReceived: null,
    submittedAt: null,
    submittedFiles: [],
    feedback: null
  },
  {
    id: 2,
    title: "AI Systems - Research Paper",
    course: "AI Systems",
    faculty: "Santosh Setapathy",
    dueDate: new Date("2026-04-15T23:59:00"),
    assignedDate: new Date("2026-04-01T09:00:00"),
    status: "completed",
    description: "Write a 3000-word research paper on the applications of Large Language Models in healthcare, discussing ethical implications and future scope.",
    instructions: "1. Use IEEE format for the paper\n2. Minimum 10 references from peer-reviewed journals\n3. Include an abstract (250 words max)\n4. Plagiarism should be below 15%",
    maxMarks: 30,
    marksReceived: 27,
    submittedAt: new Date("2026-04-14T18:32:00"),
    submittedFiles: [{ name: "AI_Research_Paper_AlexDoe.pdf", size: "2.4 MB" }],
    feedback: "Excellent analysis! Minor formatting issues in the references section."
  },
  {
    id: 3,
    title: "Computer Networks - Lab Record",
    course: "Computer Networks Lab",
    faculty: "Nitin Singh Rajput",
    dueDate: new Date("2026-04-20T17:00:00"),
    assignedDate: new Date("2026-04-10T11:00:00"),
    status: "pending",
    description: "Complete the lab record for experiments 1-5 covering TCP/IP protocols, socket programming, and network simulation using Cisco Packet Tracer.",
    instructions: "1. Include aim, theory, procedure, and result for each experiment\n2. Add screenshots of Packet Tracer simulations\n3. Handwritten observations must be scanned\n4. Submit in PDF format only",
    maxMarks: 25,
    marksReceived: null,
    submittedAt: null,
    submittedFiles: [],
    feedback: null
  },
  {
    id: 4,
    title: "Machine Learning - Model Training",
    course: "Machine Learning",
    faculty: "Rashmi Bhattad",
    dueDate: new Date("2026-04-22T23:59:00"),
    assignedDate: new Date("2026-04-08T14:00:00"),
    status: "pending",
    description: "Train a classification model on the provided dataset. Compare at least 3 algorithms (e.g., SVM, Random Forest, Neural Network) and report accuracy metrics.",
    instructions: "1. Use Python with scikit-learn or TensorFlow\n2. Include data preprocessing steps\n3. Provide confusion matrix and ROC curves\n4. Submit Jupyter notebook (.ipynb) and a brief report",
    maxMarks: 40,
    marksReceived: null,
    submittedAt: null,
    submittedFiles: [],
    feedback: null
  },
  {
    id: 5,
    title: "Embedded Systems - Microcontroller Lab",
    course: "Embedded Systems Lab",
    faculty: "Gunjan Thakur",
    dueDate: new Date("2026-04-12T17:00:00"),
    assignedDate: new Date("2026-04-02T10:00:00"),
    status: "completed",
    description: "Program an Arduino UNO to interface with a temperature sensor and LCD display. The system should display real-time temperature readings.",
    instructions: "1. Use Arduino IDE for programming\n2. Include circuit diagram (use Fritzing)\n3. Record a short video demonstration\n4. Submit code files and documentation",
    maxMarks: 20,
    marksReceived: 18,
    submittedAt: new Date("2026-04-11T16:45:00"),
    submittedFiles: [
      { name: "Arduino_TempSensor_Code.ino", size: "12 KB" },
      { name: "Circuit_Diagram.png", size: "540 KB" },
      { name: "Demo_Video.mp4", size: "15.2 MB" }
    ],
    feedback: "Good implementation. Deducted 2 marks for missing error handling in sensor readings."
  },
  {
    id: 6,
    title: "Disaster Management - Case Study",
    course: "Disaster Management",
    faculty: "Shobhit Chaturvedi",
    dueDate: new Date("2026-04-25T23:59:00"),
    assignedDate: new Date("2026-04-12T09:30:00"),
    status: "pending",
    description: "Prepare a detailed case study on the 2004 Indian Ocean Tsunami. Analyze the disaster response, preparedness level, and lessons learned for future disaster management.",
    instructions: "1. Minimum 2000 words\n2. Include maps and statistical data\n3. Discuss at least 3 mitigation strategies\n4. Use APA citation format",
    maxMarks: 30,
    marksReceived: null,
    submittedAt: null,
    submittedFiles: [],
    feedback: null
  }
];

const examResultsData = [
  {
    semester: "Semester 1",
    sgpa: 8.45,
    subjects: [
      { code: "MA101", name: "Engineering Mathematics I", credits: 4, grade: "A", gradePoint: 9 },
      { code: "PH101", name: "Engineering Physics", credits: 4, grade: "A", gradePoint: 9 },
      { code: "CS101", name: "Problem Solving with C", credits: 3, grade: "B+", gradePoint: 8 },
      { code: "ME101", name: "Engineering Graphics", credits: 3, grade: "A", gradePoint: 9 },
      { code: "EE101", name: "Basic Electrical Engineering", credits: 3, grade: "B+", gradePoint: 8 },
      { code: "EN101", name: "Communicative English", credits: 2, grade: "A+", gradePoint: 10 },
      { code: "PH101L", name: "Physics Lab", credits: 1, grade: "A", gradePoint: 9 },
      { code: "CS101L", name: "C Programming Lab", credits: 1, grade: "A+", gradePoint: 10 }
    ]
  },
  {
    semester: "Semester 2",
    sgpa: 8.62,
    subjects: [
      { code: "MA102", name: "Engineering Mathematics II", credits: 4, grade: "A", gradePoint: 9 },
      { code: "CH101", name: "Engineering Chemistry", credits: 4, grade: "B+", gradePoint: 8 },
      { code: "CS102", name: "Object Oriented Programming", credits: 3, grade: "A+", gradePoint: 10 },
      { code: "EC101", name: "Electronic Devices & Circuits", credits: 3, grade: "B+", gradePoint: 8 },
      { code: "ME102", name: "Workshop Practice", credits: 2, grade: "A", gradePoint: 9 },
      { code: "EN102", name: "Technical Writing", credits: 2, grade: "A", gradePoint: 9 },
      { code: "CH101L", name: "Chemistry Lab", credits: 1, grade: "A", gradePoint: 9 },
      { code: "CS102L", name: "OOP Lab", credits: 1, grade: "A+", gradePoint: 10 }
    ]
  },
  {
    semester: "Semester 3",
    sgpa: 8.90,
    subjects: [
      { code: "MA201", name: "Discrete Mathematics", credits: 4, grade: "A+", gradePoint: 10 },
      { code: "CS201", name: "Data Structures", credits: 4, grade: "A+", gradePoint: 10 },
      { code: "CS202", name: "Digital Logic Design", credits: 3, grade: "A", gradePoint: 9 },
      { code: "CS203", name: "Computer Organization", credits: 3, grade: "B+", gradePoint: 8 },
      { code: "HS201", name: "Economics for Engineers", credits: 2, grade: "A", gradePoint: 9 },
      { code: "CS201L", name: "Data Structures Lab", credits: 1, grade: "A+", gradePoint: 10 },
      { code: "CS202L", name: "Digital Logic Lab", credits: 1, grade: "A", gradePoint: 9 }
    ]
  },
  {
    semester: "Semester 4",
    sgpa: 8.78,
    subjects: [
      { code: "MA301", name: "Probability & Statistics", credits: 4, grade: "A", gradePoint: 9 },
      { code: "CS301", name: "Design & Analysis of Algorithms", credits: 4, grade: "A+", gradePoint: 10 },
      { code: "CS302", name: "Operating Systems", credits: 3, grade: "A", gradePoint: 9 },
      { code: "CS303", name: "Theory of Computation", credits: 3, grade: "B+", gradePoint: 8 },
      { code: "CS304", name: "Software Engineering", credits: 3, grade: "A", gradePoint: 9 },
      { code: "CS301L", name: "Algorithms Lab", credits: 1, grade: "A+", gradePoint: 10 },
      { code: "CS302L", name: "OS Lab", credits: 1, grade: "A", gradePoint: 9 }
    ]
  },
  {
    semester: "Semester 5",
    sgpa: 9.05,
    subjects: [
      { code: "CS401", name: "Database Management Systems", credits: 4, grade: "A+", gradePoint: 10 },
      { code: "CS402", name: "Computer Networks", credits: 4, grade: "A+", gradePoint: 10 },
      { code: "CS403", name: "Compiler Design", credits: 3, grade: "A", gradePoint: 9 },
      { code: "CS404", name: "Artificial Intelligence", credits: 3, grade: "A", gradePoint: 9 },
      { code: "CS405", name: "Web Development", credits: 3, grade: "A+", gradePoint: 10 },
      { code: "CS401L", name: "DBMS Lab", credits: 1, grade: "A+", gradePoint: 10 },
      { code: "CS402L", name: "Networks Lab", credits: 1, grade: "A", gradePoint: 9 }
    ]
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Clear existing data
    await UserProfile.deleteMany({});
    await Course.deleteMany({});
    await Assignment.deleteMany({});
    await ExamResult.deleteMany({});
    console.log('Cleared existing collections.');

    // Seed data
    await UserProfile.create(userProfileData);
    await Course.insertMany(coursesData);
    await Assignment.insertMany(assignmentsData);
    await ExamResult.insertMany(examResultsData);
    
    console.log('Successfully seeded database!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
