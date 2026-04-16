const mongoose = require('mongoose');
const UserProfile = require('./models/UserProfile');
const Assignment = require('./models/Assignment');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/rgx_ion_mtop';

const studentUsers = [
  {
    "name": "Jash Parekh",
    "role": "Student",
    "overallAttendance": 85,
    "tasksPending": 3,
    "notifications": 2,
    "regNumber": "23BIT033",
    "email": "23bit033@sot.pdpu.ac.in",
    "password": "1234",
    "department": "Information and Communication Technology",
    "semester": "6th Semester",
    "section": "H1",
    "batch": "2023 - 2027",
    "cgpa": 8.72,
    "phone": "+91 9099600098",
    "dob": "2004-10-22",
    "bloodGroup": "O+",
    "address": "123 University Road, Chennai, TN 600001",
    "fatherName": "John Doe",
    "motherName": "Jane Doe",
    "advisor": "Dr. B.K.Singh"
  },
  {
    "name": "Tejas Arekar",
    "role": "Student",
    "overallAttendance": 88,
    "tasksPending": 1,
    "notifications": 4,
    "regNumber": "23BIT046",
    "email": "23bit046@sot.pdpu.ac.in",
    "password": "1234",
    "department": "Information and Communication Technology",
    "semester": "6th Semester",
    "section": "H1",
    "batch": "2023 - 2027",
    "cgpa": 8.45,
    "phone": "+91 98765 11223",
    "dob": "2004-08-14",
    "bloodGroup": "B+",
    "address": "456 College Road, Ahmedabad, GJ 380009",
    "fatherName": "Richard Roe",
    "motherName": "Mary Roe",
    "advisor": "Dr. B.K.Singh"
  },
  {
    "name": "Namya Shah",
    "role": "Student",
    "overallAttendance": 92,
    "tasksPending": 0,
    "notifications": 1,
    "regNumber": "23BIT027",
    "email": "23bit027@sot.pdpu.ac.in",
    "password": "1234",
    "department": "Information and Communication Technology",
    "semester": "6th Semester",
    "section": "H2",
    "batch": "2023 - 2027",
    "cgpa": 9.12,
    "phone": "+91 98222 33445",
    "dob": "2004-05-30",
    "bloodGroup": "A-",
    "address": "789 University View, Gandhinagar, GJ 382007",
    "fatherName": "Robert Smith",
    "motherName": "Linda Smith",
    "advisor": "Dr. B.K.Singh"
  }
];

async function seedNewUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // 1. Remove old generic prof
    await UserProfile.deleteMany({ email: "prof@university.edu" });

    // 2. Fetch distinct faculty from assignments
    const assignments = await Assignment.find({});
    const facultyNames = [...new Set(assignments.map(a => a.faculty).filter(f => !!f))];
    
    console.log('Found faculties:', facultyNames);

    const profUsers = facultyNames.map((name, index) => {
      const parts = name.split(' ');
      const firstName = parts[0].toLowerCase();
      const lastName = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'prof';
      return {
        name,
        role: "Professor",
        overallAttendance: 100,
        tasksPending: 0,
        notifications: 0,
        regNumber: `FAC${100 + index}`,
        email: `${firstName}.${lastName}@university.edu`,
        password: "1234",
        department: "Computer Science & Engineering",
        semester: "Faculty",
        section: "Staff",
        batch: "N/A",
        cgpa: 0,
        phone: "+91 99999 00000",
        dob: "1980-01-01",
        bloodGroup: "O+",
        address: "Faculty Quarters",
        fatherName: "",
        motherName: "",
        advisor: ""
      };
    });

    const allUsers = [...studentUsers, ...profUsers];

    // Delete existing records to avoid duplicate keys when re-running
    const emails = allUsers.map(u => u.email);
    await UserProfile.deleteMany({ email: { $in: emails } });

    // Insert all users
    await UserProfile.insertMany(allUsers);
    console.log(`Successfully added ${allUsers.length} users to the database (Students + Dynamic Professors).`);
    
  } catch (error) {
    console.error('Error adding users:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedNewUsers();
