import { useState, useEffect } from 'react';
import { GraduationCap, Clock } from 'lucide-react';
import './Courses.css';

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
        {data.map(course => (
          <div key={course.id} className="glass-card course-card">
            <div className="course-icon">
              <GraduationCap size={28} />
            </div>
            <div className="course-header">
              <span className="course-code">{course.code}</span>
              <span className="attendance-badge">{course.attendance}% Att.</span>
            </div>
            <h3>{course.name}</h3>
            <p className="faculty">Prof: {course.faculty}</p>
            <div className="next-class">
              <Clock size={16} />
              <span>Next class: {course.nextClass}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Courses;
