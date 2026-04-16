import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, ChevronRight } from 'lucide-react';
import './Assignments.css';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function Assignments() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

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
          <div
            key={task.id}
            className="task-item complete-list flex-item clickable"
            onClick={() => navigate(`/assignments/${task.id}`)}
          >
            <div className={`status-icon ${task.status}`}>
              {task.status === 'completed' ? <CheckCircle size={24} /> : <Clock size={24} />}
            </div>
            <div className="task-info">
              <h4>{task.title}</h4>
              <p>{task.course} • {task.faculty}</p>
            </div>
            <div className="task-meta">
              <span className={`badge ${task.status}`}>
                {task.status === 'completed' ? 'Turned In' : 'Pending'}
              </span>
              <p className="due-date">Due: {formatDate(task.dueDate)}</p>
              {task.marksReceived !== null && (
                <p className="marks-info">{task.marksReceived}/{task.maxMarks} pts</p>
              )}
            </div>
            <ChevronRight size={20} className="chevron-icon" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Assignments;
