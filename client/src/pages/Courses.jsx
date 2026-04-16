import { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './Courses.css';

function getAttendanceColor(att) {
  if (att >= 90) return '#10B981';
  if (att >= 80) return '#3B82F6';
  if (att >= 75) return '#F59E0B';
  return '#EF4444';
}

function Courses() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/courses')
      .then(res => res.json())
      .then(data => setData(data.courses))
      .catch(console.error);
  }, []);

  return (
    <div className="courses-page">
      <header className="page-header">
        <div>
          <h1>My Courses</h1>
          <p className="text-muted">Currently enrolled subjects overview.</p>
        </div>
      </header>

      <div className="courses-grid">
        {data.map(course => {
          const color = getAttendanceColor(course.attendance);
          const chartData = [
            { name: 'Present', value: course.attendance },
            { name: 'Absent', value: 100 - course.attendance },
          ];

          return (
            <div key={course.id} className="glass-card course-card">
              <div className="course-card-top">
                <div className="course-icon">
                  <GraduationCap size={28} />
                </div>
                <div className="course-chart-wrap">
                  <ResponsiveContainer width={64} height={64}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={22}
                        outerRadius={30}
                        stroke="none"
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        <Cell fill={color} />
                        <Cell fill="rgba(255,255,255,0.06)" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <span className="chart-center-text" style={{ color }}>
                    {course.attendance}%
                  </span>
                </div>
              </div>

              <div className="course-header">
                <span className="course-code">{course.code}</span>
                <span
                  className="attendance-badge"
                  style={{
                    background: `${color}18`,
                    color: color,
                  }}
                >
                  {course.attendance >= 75 ? 'On Track' : 'Low'}
                </span>
              </div>

              <h3>{course.name}</h3>
              <p className="faculty">Prof: {course.faculty}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Courses;

