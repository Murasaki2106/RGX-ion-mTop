import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import './TopBar.css';

function TopBar({ onLogout }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/profile')
      .then(res => res.json())
      .then(data => setUser(data.profile))
      .catch(console.error);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    onLogout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="topbar">
      <div style={{ position: 'relative' }}>
        <button
          className={`profile-trigger ${open ? 'open' : ''}`}
          onClick={() => setOpen(!open)}
        >
          <img src={user.avatar} alt="Profile" className="trigger-avatar" />
          <div className="trigger-info">
            <span className="trigger-name">{user.name}</span>
            <span className="trigger-role">{user.regNumber}</span>
          </div>
          <ChevronDown size={16} className="trigger-chevron" />
        </button>

        {open && (
          <>
            <div className="dropdown-overlay" onClick={() => setOpen(false)} />
            <div className="profile-dropdown" ref={dropdownRef}>
              <div className="dropdown-header">
                <img src={user.avatar} alt="Profile" className="dd-avatar" />
                <div className="dd-info">
                  <h4>{user.name}</h4>
                  <p>{user.department}</p>
                  <span className="dd-reg">{user.regNumber}</span>
                </div>
              </div>

              <div className="dropdown-stats">
                <div className="dd-stat">
                  <span className="dd-stat-value">{user.cgpa}</span>
                  <span className="dd-stat-label">CGPA</span>
                </div>
                <div className="dd-stat">
                  <span className="dd-stat-value">{user.overallAttendance}%</span>
                  <span className="dd-stat-label">Attendance</span>
                </div>
                <div className="dd-stat">
                  <span className="dd-stat-value">{user.semester.split(' ')[0]}</span>
                  <span className="dd-stat-label">Semester</span>
                </div>
              </div>

              <div className="dropdown-menu">
                <Link
                  to="/profile"
                  className="dd-item"
                  onClick={() => setOpen(false)}
                >
                  <User size={18} />
                  My Profile
                </Link>
                <button className="dd-item" onClick={() => { setOpen(false); alert('Settings coming soon!'); }}>
                  <Settings size={18} />
                  Settings
                </button>
                <button className="dd-item" onClick={() => { setOpen(false); alert('Contact your department for support.'); }}>
                  <HelpCircle size={18} />
                  Help & Support
                </button>
                <div className="dd-divider" />
                <button className="dd-item danger" onClick={handleLogout}>
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TopBar;
