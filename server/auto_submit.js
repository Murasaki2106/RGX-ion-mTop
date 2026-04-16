const mongoose = require('mongoose');
const Assignment = require('./models/Assignment');
const Submission = require('./models/Submission');
const UserProfile = require('./models/UserProfile');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/rgx_ion_mtop';

const dummyBase64 = "data:text/plain;base64,VGhpcyBpcyB0aGUgc3R1ZGVudCdzIHN1Ym1pdHRlZCBhc3NpZ25tZW50IHdvcmsu";

async function forceCompleteTasks() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to Database. Commencing Task Resolution...');

    const students = await UserProfile.find({ role: 'Student' });
    const assignments = await Assignment.find({ status: 'active' });

    let operations = 0;

    for (let student of students) {
      for (let assg of assignments) {
        // Check if student already handed it in
        const exists = await Submission.findOne({ 
          assignmentId: assg.id, 
          studentEmail: student.email 
        });

        if (!exists) {
          const newSub = new Submission({
            assignmentId: assg.id,
            studentEmail: student.email,
            studentName: student.name,
            status: 'completed',
            submittedAt: new Date(Date.now() - Math.floor(Math.random() * 100000000)), // Randomize submission time slightly
            submittedFiles: [
              {
                name: `Submission_${assg.id}_${student.name.split(' ')[0]}.txt`,
                size: '12 KB',
                type: 'text/plain',
                dataUrl: dummyBase64,
                isLocal: true
              }
            ]
          });
          await newSub.save();
          operations++;
        }
      }
    }

    console.log(`Successfully completed and spoofed ${operations} pending assignments across ${students.length} students!`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

forceCompleteTasks();
