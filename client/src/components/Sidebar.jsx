import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, GraduationCap, ClipboardList, LogOut, Bell } from 'lucide-react';
import './Sidebar.css';

function Sidebar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <aside className="sidebar glass-card">
      <div className="sidebar-header">
        <GraduationCap className="brand-logo" size={32} />
        <h2>RGX ion mtop</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/assignments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BookOpen size={20} />
          <span>Assignments</span>
        </NavLink>

        <NavLink to="/courses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <GraduationCap size={20} />
          <span>Courses</span>
        </NavLink>

        <NavLink to="/results" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ClipboardList size={20} />
          <span>Exam Results</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item action-btn" onClick={() => alert('You have 2 new notifications.')}>
          <Bell size={20} />
          <span>Notifications</span>
        </button>
        <button className="nav-item action-btn error" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

