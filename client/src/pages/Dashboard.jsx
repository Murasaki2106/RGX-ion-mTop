import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { BookOpen, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import './Dashboard.css';

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/dashboard')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(console.error);
  }, []);

  if (!data) return <div className="loader">Loading...</div>;

  const { user, recentAssignments, enrolledCourses } = data;

  const attendanceData = [
    { name: 'Present', value: user.overallAttendance },
    { name: 'Absent', value: 100 - user.overallAttendance },
  ];

  const COLORS = ['#3B82F6', '#1E293B'];

  return (
    <div className="dashboard">
      <header className="page-header">
        <div>
          <h1>Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="text-muted">Here's what's happening today.</p>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Attendance Widget */}
        <div className="glass-card attendance-widget">
          <h3>Overall Attendance</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  stroke="none"
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="attendance-value">
              <h2>{user.overallAttendance}%</h2>
            </div>
          </div>
          <p className="status-text success">You're on track!</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="stats-grid">
          <div className="glass-card stat-card">
            <div className="stat-icon warning"><AlertCircle /></div>
            <div>
              <h3>{user.tasksPending}</h3>
              <p>Tasks Pending</p>
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon info"><BookOpen /></div>
            <div>
              <h3>{enrolledCourses}</h3>
              <p>Enrolled Courses</p>
            </div>
          </div>
        </div>

        {/* Recent Assignments Widget */}
        <div className="glass-card assignments-widget">
          <div className="widget-header">
            <h3>Urgent Tasks</h3>
            <Link to="/assignments" className="text-link" style={{ textDecoration: 'none' }}>View All</Link>
          </div>
          <div className="task-list">
            {recentAssignments.map(task => (
              <div key={task.id} className="task-item">
                <div className={`status-icon ${task.status}`}>
                  {task.status === 'completed' ? <CheckCircle size={18} /> : <Clock size={18} />}
                </div>
                <div className="task-info">
                  <h4>{task.title}</h4>
                  <p>{task.course} • {task.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
