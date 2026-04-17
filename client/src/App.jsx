import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Assignments from './pages/Assignments';
import AssignmentDetail from './pages/AssignmentDetail';
import Courses from './pages/Courses';
import Profile from './pages/Profile';
import ExamResults from './pages/ExamResults';
import Login from './pages/Login';
import ProfessorDashboard from './pages/ProfessorDashboard';
import './index.css';

function App() {
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('userEmail') || null;
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || null;
  });

  // Fallback: If userEmail is stored but userRole isn't, fetch and recover it
  useEffect(() => {
    if (userEmail && !userRole) {
      fetch(`http://localhost:5000/api/profile?email=${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(data => {
          if (data.profile && data.profile.role) {
            setUserRole(data.profile.role);
            localStorage.setItem('userRole', data.profile.role);
          }
        })
        .catch(console.error);
    }
  }, [userEmail, userRole]);

  const handleLogin = (email, role, remember) => {
    setUserEmail(email);
    setUserRole(role);
    if (remember) {
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userRole', role);
    }
  };

  const handleLogout = () => {
    setUserEmail(null);
    setUserRole(null);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
  };

  return (
    <BrowserRouter>
      <Routes>
        {!userEmail ? (
          <>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <Route path="/" element={<Layout userRole={userRole} userEmail={userEmail} onLogout={handleLogout} />}>
            {userRole === 'Professor' ? (
              <>
                <Route index element={<Navigate to="/prof-dashboard" replace />} />
                <Route path="prof-dashboard" element={<ProfessorDashboard userEmail={userEmail} />} />
                <Route path="profile" element={<Profile userEmail={userEmail} />} />
                <Route path="*" element={<Navigate to="/prof-dashboard" replace />} />
              </>
            ) : (
              <>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard userEmail={userEmail} />} />
                <Route path="assignments" element={<Assignments userEmail={userEmail} />} />
                <Route path="assignments/:id" element={<AssignmentDetail userEmail={userEmail} />} />
                <Route path="courses" element={<Courses userEmail={userEmail} />} />
                <Route path="profile" element={<Profile userEmail={userEmail} />} />
                <Route path="results" element={<ExamResults userEmail={userEmail} />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </>
            )}
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

