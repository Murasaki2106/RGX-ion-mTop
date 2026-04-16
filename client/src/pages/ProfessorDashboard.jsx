import { useState, useEffect } from 'react';
import { Users, BookOpen, CheckCircle, Clock, Calendar, Save, Plus, X, ChevronDown, ChevronRight } from 'lucide-react';
import './ProfessorDashboard.css';

function ProfessorDashboard({ userEmail }) {
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' | 'attendance'
  const [profProfile, setProfProfile] = useState(null);
  
  // -- Assignments & Grading State --
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);
  const [marksState, setMarksState] = useState({});
  const [gradingLoads, setGradingLoads] = useState({});

  // Assignment Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newMaxMarks, setNewMaxMarks] = useState('100');
  
  const [derivedCourse, setDerivedCourse] = useState('');

  // -- Attendance State --
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [attLoading, setAttLoading] = useState(false);

  // 1. Load Profile
  useEffect(() => {
    if (userEmail) {
      fetch(`http://localhost:5000/api/profile?email=${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(data => setProfProfile(data.profile))
        .catch(console.error);
    }
  }, [userEmail]);

  // 2. Load Core Data: Assignments & Submissions
  const fetchAssignmentData = () => {
    if (!profProfile) return;
    
    // Fetch Assignments
    fetch(`http://localhost:5000/api/professor/assignments?professorName=${encodeURIComponent(profProfile.name)}`)
      .then(res => res.json())
      .then(data => setAssignments(data.assignments))
      .catch(console.error);

    // Fetch Submissions globally for this prof
    fetch(`http://localhost:5000/api/submissions?professorName=${encodeURIComponent(profProfile.name)}`)
      .then(res => res.json())
      .then(data => {
        setSubmissions(data.submissions);
        const initialMarks = {};
        data.submissions.forEach(sub => {
          if (sub.marksReceived !== null) {
            initialMarks[sub._id] = sub.marksReceived;
          }
        });
        setMarksState(initialMarks);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (activeTab === 'assignments') {
      fetchAssignmentData();
    }
  }, [profProfile, activeTab]);

  // 3. Load Meta lists for Attendance & Form
  useEffect(() => {
    fetch('http://localhost:5000/api/courses')
      .then(res => res.json())
      .then(data => {
        setCourses(data.courses);
        if (data.courses.length > 0) {
          setSelectedCourse(data.courses[0].id.toString());
          setNewCourse(data.courses[0].title);
        }
      })
      .catch(console.error);
      
    if (activeTab === 'attendance') {
      fetch('http://localhost:5000/api/students')
        .then(res => res.json())
        .then(data => setStudents(data.students))
        .catch(console.error);
    }
  }, [activeTab]);

  // Compute Default Course automatically so the Professor doesn't have to select it
  useEffect(() => {
    if (assignments.length > 0) {
      setDerivedCourse(assignments[0].course);
      setNewCourse(assignments[0].course);
    } else if (profProfile && courses.length > 0) {
      const match = courses.find(c => c.faculty && c.faculty.includes(profProfile.name));
      if (match) {
        setDerivedCourse(match.title);
        setNewCourse(match.title);
      } else {
        setDerivedCourse(courses[0].title);
        setNewCourse(courses[0].title);
      }
    }
  }, [assignments, courses, profProfile]);

  // 4. Load attendance for specific date/course
  useEffect(() => {
    if (activeTab === 'attendance' && selectedCourse && selectedDate) {
      setAttLoading(true);
      fetch(`http://localhost:5000/api/attendance?date=${selectedDate}&courseId=${selectedCourse}`)
        .then(res => res.json())
        .then(data => {
          const map = {};
          data.records.forEach(r => {
            map[r.studentEmail] = r.status;
          });
          setAttendanceData(map);
        })
        .catch(console.error)
        .finally(() => setAttLoading(false));
    }
  }, [activeTab, selectedCourse, selectedDate]);

  // -- Handlers --
  const handleGradeUpdate = async (subId) => {
    const marks = marksState[subId];
    if (marks === undefined) return;
    
    setGradingLoads({ ...gradingLoads, [subId]: true });
    
    try {
      const response = await fetch(`http://localhost:5000/api/submissions/${subId}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marks })
      });
      const data = await response.json();
      if (data.success) {
        // Updated correctly
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGradingLoads({ ...gradingLoads, [subId]: false });
    }
  };

  const handleMarkAttendance = async (studentEmail, status) => {
    if (!profProfile) return;
    setAttendanceData({ ...attendanceData, [studentEmail]: status });

    try {
      await fetch(`http://localhost:5000/api/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          date: selectedDate, 
          courseId: selectedCourse, 
          studentEmail, 
          status,
          markedBy: profProfile.email 
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newTitle || !newDueDate) return alert('Fill required fields');

    try {
      const response = await fetch('http://localhost:5000/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          course: newCourse,
          faculty: profProfile.name,
          dueDate: newDueDate,
          description: newInstructions,
          instructions: newInstructions,
          maxMarks: newMaxMarks
        })
      });
      
      const payload = await response.json();
      if (payload.success) {
        setShowCreateModal(false);
        setNewTitle('');
        setNewInstructions('');
        fetchAssignmentData();
      }
    } catch (err) {
      console.error('Error creating assignment', err);
    }
  };

  if (!profProfile) return <div className="loader">Initializing Dashboard...</div>;

  return (
    <div className="prof-dashboard">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Faculty Dashboard</h1>
          <p className="text-muted">Welcome, {profProfile.name}</p>
        </div>
        {activeTab === 'assignments' && (
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} /> Create Assignment
          </button>
        )}
      </header>

      <div className="prof-tabs">
        <button 
          className={activeTab === 'assignments' ? 'active' : ''} 
          onClick={() => setActiveTab('assignments')}
        >
          <BookOpen size={18} /> Assignments
        </button>
        <button 
          className={activeTab === 'attendance' ? 'active' : ''} 
          onClick={() => setActiveTab('attendance')}
        >
          <Users size={18} /> Attendance
        </button>
      </div>

      {activeTab === 'assignments' && (
        <div className="glass-card module-card assignments-view">
          <h3>Your Assignments Roster</h3>
          
          <div className="assignments-list">
            {assignments.length === 0 && <p style={{opacity: 0.5, marginTop: '1rem'}}>You haven't generated any assignments yet.</p>}
            
            {assignments.map(assg => {
              const expands = expandedAssignment === assg.id;
              const relatedSubmissions = submissions.filter(s => s.assignmentId === assg.id);
              
              return (
                <div key={assg.id} className="assignment-item">
                  <div 
                    className="assignment-header" 
                    onClick={() => setExpandedAssignment(expands ? null : assg.id)}
                  >
                    <div className="assg-title-row">
                      {expands ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
                      <strong>{assg.title}</strong>
                      <span className="assg-course-tag">{assg.course}</span>
                    </div>
                    <div className="assg-meta-row">
                      <span>Due: {new Date(assg.dueDate).toLocaleDateString()}</span>
                      <span className="count-pill">{relatedSubmissions.length} Submissions</span>
                    </div>
                  </div>
                  
                  {expands && (
                    <div className="assignment-body">
                      {relatedSubmissions.length === 0 ? (
                        <p className="empty-subs-msg">No submissions found for this assignment yet.</p>
                      ) : (
                        <table className="results-table">
                          <thead>
                            <tr>
                              <th>Student Name</th>
                              <th>Status</th>
                              <th>Files Attached</th>
                              <th>Score / {assg.maxMarks || 100}</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {relatedSubmissions.map(sub => (
                              <tr key={sub._id}>
                                <td>
                                  <strong>{sub.studentName}</strong> <br/>
                                  <small className="text-muted">{sub.studentEmail}</small>
                                </td>
                                <td>
                                  {sub.status === 'completed' ? (
                                    <span className="status-badge success"><CheckCircle size={14}/> Submitted</span>
                                  ) : (
                                    <span className="status-badge pending"><Clock size={14}/> Pending</span>
                                  )}
                                </td>
                                <td>
                                  {sub.submittedFiles && sub.submittedFiles.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                      {sub.submittedFiles.map((file, idx) => (
                                        <a 
                                          key={idx} 
                                          href="#"
                                          onClick={(e) => { e.preventDefault(); setViewingFile(file); }}
                                          title="View Attachment"
                                          style={{ color: 'var(--primary-light)', textDecoration: 'none', fontSize: '0.85rem' }}
                                        >
                                          📄 {file.name}
                                        </a>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-muted">None</span>
                                  )}
                                </td>
                                <td>
                                  <input 
                                    type="number"
                                    className="mark-input"
                                    placeholder="N/A"
                                    value={marksState[sub._id] !== undefined ? marksState[sub._id] : ''}
                                    disabled={sub.status !== 'completed'}
                                    onChange={(e) => setMarksState({...marksState, [sub._id]: e.target.value})}
                                    max={assg.maxMarks || 100}
                                    min="0"
                                  />
                                </td>
                                <td>
                                  <button 
                                    className="btn-save text-primary"
                                    disabled={sub.status !== 'completed' || gradingLoads[sub._id]}
                                    onClick={() => handleGradeUpdate(sub._id)}
                                  >
                                    {gradingLoads[sub._id] ? 'Saving...' : <><Save size={16}/> Save</>}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FILE VIEWER OVERLAY */}
      {viewingFile && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ width: '90%', height: '90%', maxWidth: '1200px', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h2>{viewingFile.name}</h2>
              <button onClick={() => setViewingFile(null)} className="close-btn"><X size={24}/></button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden', background: '#e5e7eb', borderRadius: '8px' }}>
              {viewingFile.type && viewingFile.type.startsWith('image/') ? (
                <div style={{ width:'100%', height:'100%', display:'flex', justifyContent:'center', alignItems:'center' }}>
                  <img src={viewingFile.dataUrl} alt={viewingFile.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              ) : viewingFile.type === 'application/pdf' ? (
                <embed 
                  src={viewingFile.dataUrl} 
                  type="application/pdf" 
                  style={{ width: '100%', height: '100%', border: 'none' }} 
                />
              ) : viewingFile.type && viewingFile.type.startsWith('text/') ? (
                <iframe 
                  src={viewingFile.dataUrl} 
                  style={{ width: '100%', height: '100%', border: 'none', backgroundColor: 'white' }} 
                  title="File Viewer" 
                />
              ) : (
                <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', background:'#1f2937', color:'white', gap:'1.5rem' }}>
                  <div style={{ padding:'2rem', background:'rgba(255,255,255,0.05)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <h3 style={{ marginBottom:'0.5rem' }}>Preview Not Available</h3>
                    <p style={{ color:'#9ca3af', maxWidth:'400px', lineHeight:'1.5', margin:'0 auto' }}>
                      The file <strong>{viewingFile.name}</strong> ({viewingFile.type || 'Unknown Type'}) cannot be natively rendered inside the browser.
                    </p>
                  </div>
                  <a 
                    href={viewingFile.dataUrl} 
                    download={viewingFile.name}
                    className="btn-primary"
                    style={{ textDecoration:'none', marginTop:'1rem' }}
                  >
                    Download File to View
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE ASSIGNMENT OVERLAY */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <h2>Deploy New Assignment</h2>
              <button onClick={() => setShowCreateModal(false)} className="close-btn"><X size={24}/></button>
            </div>
            <form onSubmit={handleCreateAssignment} className="create-assg-form">
              <div className="form-group">
                <label>Assignment Title</label>
                <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Unit 3 Homework" />
              </div>
              <div className="form-group-row">
                <div className="form-group">
                  <label>Course (Assigned)</label>
                  <input type="text" disabled value={derivedCourse} />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" required value={newDueDate} onChange={e => setNewDueDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Max Marks</label>
                  <input type="number" required value={newMaxMarks} onChange={e => setNewMaxMarks(e.target.value)} min="1" max="1000" />
                </div>
              </div>
              <div className="form-group">
                <label>Instructions & Description</label>
                <textarea rows="4" value={newInstructions} onChange={e => setNewInstructions(e.target.value)} placeholder="Provide guidelines..."></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Post Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ATTENDANCE SECTION */}
      {activeTab === 'attendance' && (
        <div className="glass-card module-card">
          <div className="att-filters">
            <div className="filter-group">
              <label>Date</label>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={e => setSelectedDate(e.target.value)} 
                className="att-input"
              />
            </div>
            <div className="filter-group">
              <label>Course</label>
              <select 
                value={selectedCourse} 
                onChange={e => setSelectedCourse(e.target.value)}
                className="att-input"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>
          
          {attLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading roster...</div>
          ) : (
            <div className="submissions-table-wrap">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Reg. Number</th>
                    <th>Student Name</th>
                    <th>Current Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const currentStatus = attendanceData[student.email];
                    return (
                      <tr key={student.email}>
                        <td>{student.regNumber}</td>
                        <td>{student.name}</td>
                        <td>
                           {currentStatus === 'Present' && <span className="status-badge success">Present</span>}
                           {currentStatus === 'Absent' && <span className="status-badge error">Absent</span>}
                           {!currentStatus && <span className="status-badge pending">Not Marked</span>}
                        </td>
                        <td>
                          <div className="att-actions">
                            <button 
                              className={`btn-att ${currentStatus === 'Present' ? 'active-p' : ''}`}
                              onClick={() => handleMarkAttendance(student.email, 'Present')}
                            >
                              P
                            </button>
                            <button 
                              className={`btn-att ${currentStatus === 'Absent' ? 'active-a' : ''}`}
                              onClick={() => handleMarkAttendance(student.email, 'Absent')}
                            >
                              A
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfessorDashboard;
