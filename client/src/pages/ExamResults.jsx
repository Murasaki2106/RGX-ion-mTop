import { useState, useEffect } from 'react';
import { ChevronDown, FileText, Award, BookOpen, TrendingUp } from 'lucide-react';
import './ExamResults.css';

function getGradeClass(grade) {
  if (grade === 'A+') return 'a-plus';
  if (grade === 'A') return 'a';
  if (grade === 'B+') return 'b-plus';
  if (grade === 'B') return 'b';
  return 'c';
}

function ExamResults({ userEmail }) {
  const [data, setData] = useState(null);
  const [selectedSem, setSelectedSem] = useState('');

  useEffect(() => {
    if (userEmail) {
      fetch(`http://localhost:5000/api/results?email=${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(data => {
          setData(data);
          if (data.semesters.length > 0) {
            setSelectedSem(data.semesters[data.semesters.length - 1]);
          }
        })
        .catch(console.error);
    }
  }, [userEmail]);

  if (!data) return <div className="loader">Loading...</div>;

  const semData = data.results[selectedSem];
  const totalCredits = semData.subjects.reduce((sum, s) => sum + s.credits, 0);
  const totalSubjects = semData.subjects.length;

  return (
    <div className="results-page">
      <header className="page-header">
        <div>
          <h1>Exam Results</h1>
          <p className="text-muted">View your semester-wise academic performance.</p>
        </div>
      </header>

      {/* Semester selector */}
      <div className="semester-selector">
        <label>Select Semester:</label>
        <div className="semester-dropdown">
          <select
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value)}
          >
            {data.semesters.map(sem => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
          <ChevronDown size={16} className="dropdown-arrow" />
        </div>
      </div>

      {/* Stats strip */}
      <div className="results-stats">
        <div className="glass-card result-stat-card">
          <div className="stat-val blue">{semData.sgpa}</div>
          <div className="stat-lbl">SGPA</div>
        </div>
        <div className="glass-card result-stat-card">
          <div className="stat-val green">{data.cgpa}</div>
          <div className="stat-lbl">CGPA</div>
        </div>
        <div className="glass-card result-stat-card">
          <div className="stat-val purple">{totalCredits}</div>
          <div className="stat-lbl">Credits</div>
        </div>
        <div className="glass-card result-stat-card">
          <div className="stat-val amber">{totalSubjects}</div>
          <div className="stat-lbl">Subjects</div>
        </div>
      </div>

      {/* Results Table */}
      <div className="glass-card results-table-wrap">
        <h3><FileText size={18} /> {selectedSem} — Subject-wise Results</h3>
        <table className="results-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Subject</th>
              <th className="credits-cell">Credits</th>
              <th>Grade</th>
              <th className="gp-cell">Grade Point</th>
            </tr>
          </thead>
          <tbody>
            {semData.subjects.map((sub, i) => (
              <tr key={i}>
                <td className="subject-code">{sub.code}</td>
                <td className="subject-name">{sub.name}</td>
                <td className="credits-cell">{sub.credits}</td>
                <td>
                  <span className={`grade-badge ${getGradeClass(sub.grade)}`}>
                    {sub.grade}
                  </span>
                </td>
                <td className="gp-cell">{sub.gradePoint}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExamResults;
