import { useState, useEffect } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import './Assignments.css';

function Assignments() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/assignments')
      .then(res => res.json())
      .then(data => setData(data.assignments))
      .catch(console.error);
  }, []);

  return (
    <div className="assignments-page">
      <header className="page-header">
        <div>
          <h1>Assignments</h1>
          <p className="text-muted">Keep track of your deadlines.</p>
        </div>
      </header>

      <div className="glass-card full-list">
        {data.map(task => (
          <div key={task.id} className="task-item complete-list flex-item">
            <div className={`status-icon ${task.status}`}>
              {task.status === 'completed' ? <CheckCircle size={24} /> : <Clock size={24} />}
            </div>
            <div className="task-info">
              <h4>{task.title}</h4>
              <p>{task.course}</p>
            </div>
            <div className="task-meta">
              <span className={`badge ${task.status}`}>
                {task.status === 'completed' ? 'Completed' : 'Pending'}
              </span>
              <p className="due-date">Due: {task.dueDate}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Assignments;
