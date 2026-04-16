import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, Clock, AlertTriangle, Calendar,
  User, BookOpen, Award, Upload, FileText, X, Send, MessageSquare
} from 'lucide-react';
import './AssignmentDetail.css';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function AssignmentDetail({ userEmail }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [assignment, setAssignment] = useState(null);
  const [localFiles, setLocalFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    if (!userEmail) return;
    fetch(`http://localhost:5000/api/assignments/${id}?email=${encodeURIComponent(userEmail)}`)
      .then(res => res.json())
      .then(data => {
        setAssignment(data.assignment);
        if (data.assignment.submittedFiles?.length > 0) {
          setLocalFiles(data.assignment.submittedFiles);
        }
      })
      .catch(console.error);
  }, [id, userEmail]);

  if (!assignment) return <div className="loader">Loading...</div>;

  const isCompleted = assignment.status === 'completed';
  const isPastDue = new Date(assignment.dueDate) < new Date() && !isCompleted;
  const statusClass = isCompleted ? 'turned-in' : isPastDue ? 'overdue' : 'not-turned-in';

  const handleFileSelect = async (e) => {
    const rawFiles = Array.from(e.target.files);
    
    // Strict validation: Only allow PDF files
    const files = rawFiles.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (files.length !== rawFiles.length) {
      alert("Invalid format: You may only upload PDF (.pdf) documents for assignments.");
      if (files.length === 0) return;
    }
    
    const newFiles = await Promise.all(files.map(f => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          let fileType = f.type;
          if (!fileType) {
            const ext = f.name.split('.').pop().toLowerCase();
            if (ext === 'docx') fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            else if (ext === 'doc') fileType = 'application/msword';
            else if (ext === 'xlsx') fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            else if (ext === 'xls') fileType = 'application/vnd.ms-excel';
            else if (ext === 'pptx') fileType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
            else if (ext === 'ppt') fileType = 'application/vnd.ms-powerpoint';
            else if (ext === 'zip') fileType = 'application/zip';
            else if (ext === 'csv') fileType = 'text/csv';
            else if (ext === 'txt') fileType = 'text/plain';
            else if (ext === 'pdf') fileType = 'application/pdf';
          }
          resolve({
            name: f.name,
            size: f.size > 1048576
              ? (f.size / 1048576).toFixed(1) + ' MB'
              : (f.size / 1024).toFixed(0) + ' KB',
            type: fileType || 'Unknown Type',
            dataUrl: reader.result,
            isLocal: true
          });
        };
        reader.readAsDataURL(f);
      });
    }));

    setLocalFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setLocalFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (localFiles.length === 0 || !userEmail) return;
    setSubmitting(true);

    try {
      const res = await fetch(`http://localhost:5000/api/assignments/${id}/submit?email=${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: localFiles })
      });
      const data = await res.json();
      if (data.success) {
        setAssignment(data.assignment);
        setJustSubmitted(true);
        setTimeout(() => setJustSubmitted(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const instructionLines = assignment.instructions
    ? assignment.instructions.split('\n').filter(l => l.trim())
    : [];

  return (
    <div className="assignment-detail">
      <button className="back-btn" onClick={() => navigate('/assignments')}>
        <ArrowLeft size={18} />
        Back to Assignments
      </button>

      <header className="page-header">
        <div>
          <h1>{assignment.title}</h1>
          <p className="text-muted">{assignment.course}</p>
        </div>
      </header>

      {/* Status Banner */}
      <div className={`status-banner ${statusClass}`}>
        <div className="status-left">
          <div className="status-icon-wrap">
            {isCompleted ? <CheckCircle size={20} /> : isPastDue ? <AlertTriangle size={20} /> : <Clock size={20} />}
          </div>
          <div className="status-text">
            <h4>
              {isCompleted ? 'Turned In' : isPastDue ? 'Past Due' : 'Not Turned In'}
            </h4>
            <p>
              {isCompleted
                ? `Submitted on ${formatDateTime(assignment.submittedAt)}`
                : isPastDue
                  ? `Was due ${formatDate(assignment.dueDate)}`
                  : `Due ${formatDate(assignment.dueDate)}`
              }
            </p>
          </div>
        </div>
        <div className="marks-display">
          {assignment.marksReceived !== null ? (
            <>
              <div className="marks-value">
                {assignment.marksReceived}<span> / {assignment.maxMarks}</span>
              </div>
              <div className="marks-label">Points</div>
            </>
          ) : (
            <>
              <div className="marks-value">
                —<span> / {assignment.maxMarks}</span>
              </div>
              <div className="marks-label">Points</div>
            </>
          )}
        </div>
      </div>

      {/* Meta cards */}
      <div className="detail-meta">
        <div className="glass-card meta-card">
          <div className="meta-icon blue"><Calendar size={18} /></div>
          <div className="meta-info">
            <p>Assigned</p>
            <h4>{formatDate(assignment.assignedDate)}</h4>
          </div>
        </div>
        <div className="glass-card meta-card">
          <div className="meta-icon amber"><Clock size={18} /></div>
          <div className="meta-info">
            <p>Due Date</p>
            <h4>{formatDate(assignment.dueDate)}</h4>
          </div>
        </div>
        <div className="glass-card meta-card">
          <div className="meta-icon purple"><User size={18} /></div>
          <div className="meta-info">
            <p>Faculty</p>
            <h4>{assignment.faculty}</h4>
          </div>
        </div>
        <div className="glass-card meta-card">
          <div className="meta-icon green"><Award size={18} /></div>
          <div className="meta-info">
            <p>Max Marks</p>
            <h4>{assignment.maxMarks} points</h4>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="detail-layout">
        {/* Left - Assignment content */}
        <div className="detail-main">
          <div className="glass-card detail-section">
            <h3><BookOpen size={18} /> Description</h3>
            <p className="description-text">{assignment.description}</p>
          </div>

          {instructionLines.length > 0 && (
            <div className="glass-card detail-section">
              <h3><FileText size={18} /> Instructions</h3>
              <ol className="instructions-list">
                {instructionLines.map((line, i) => {
                  const text = line.replace(/^\d+\.\s*/, '');
                  return (
                    <li key={i}>
                      <span className="step-num">{i + 1}</span>
                      {text}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>

        {/* Right - My Work panel */}
        <div className="glass-card my-work-panel">
          <h3>My Work</h3>

          {isCompleted && assignment.submittedAt && (
            <div className="submitted-time">
              <CheckCircle size={14} />
              Submitted {formatDateTime(assignment.submittedAt)}
            </div>
          )}

          {/* File upload area (only if not submitted) */}
          {!isCompleted && (
            <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
              <Upload size={28} />
              <p>Drag files here or <span className="browse-link">browse</span> (PDF Only)</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
              />
            </div>
          )}

          {/* Files list */}
          {localFiles.length > 0 && (
            <div className="files-list">
              {localFiles.map((file, i) => (
                <div key={i} className="file-item">
                  <div className="file-icon-wrap">
                    <FileText size={16} />
                  </div>
                  <div className="file-details">
                    <h5>{file.name}</h5>
                    <p>{file.size}</p>
                  </div>
                  {!isCompleted && (
                    <button className="remove-file" onClick={() => removeFile(i)}>
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Submit / Submitted button */}
          {!isCompleted ? (
            <button
              className="submit-btn"
              disabled={localFiles.length === 0 || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send size={16} />
                  Turn In
                </>
              )}
            </button>
          ) : (
            <button className="submit-btn submitted" disabled>
              <CheckCircle size={16} />
              {justSubmitted ? 'Submitted Successfully!' : 'Turned In'}
            </button>
          )}

          {/* Feedback */}
          {assignment.feedback && (
            <div className="feedback-section">
              <h4><MessageSquare size={14} /> Faculty Feedback</h4>
              <p>{assignment.feedback}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssignmentDetail;
