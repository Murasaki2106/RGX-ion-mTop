import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, GraduationCap, ClipboardList, LogOut, Bell, X } from 'lucide-react';
import './Sidebar.css';

function Sidebar({ userRole, userEmail, onLogout }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (userEmail) {
      fetchNotifications();
      // Poll every 30s
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userEmail]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/notifications?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpenNotifications = async () => {
    setShowNotifications(true);
    if (unreadCount > 0) {
      try {
        await fetch(`http://localhost:5000/api/notifications/read?email=${encodeURIComponent(userEmail)}`, { method: 'POST' });
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <>
    <aside className="sidebar glass-card">
      <div className="sidebar-header">
        <GraduationCap className="brand-logo" size={32} />
        <h2>RGX ion mtop</h2>
      </div>

      <nav className="sidebar-nav">
        {userRole === 'Professor' ? (
          <NavLink to="/prof-dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <ClipboardList size={20} />
            <span>Submissions</span>
          </NavLink>
        ) : (
          <>
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
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="notification-btn-wrapper">
          <button className="nav-item action-btn" onClick={handleOpenNotifications}>
            <Bell size={20} />
            <span>Notifications</span>
          </button>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </div>
        <button className="nav-item action-btn error" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
    
    {showNotifications && (
      <div className="notifications-overlay" onClick={() => setShowNotifications(false)}>
        <div className="notifications-modal" onClick={e => e.stopPropagation()}>
          <div className="notif-header">
            <h3><Bell size={20} /> Notifications</h3>
            <button className="notif-close" onClick={() => setShowNotifications(false)}>
              <X size={20} />
            </button>
          </div>
          
          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <Bell size={48} strokeWidth={1} />
                <p>You have no notifications right now.</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div key={notif._id} className={`notif-item ${!notif.read ? 'unread' : ''}`}>
                  <div className="notif-title">{notif.title}</div>
                  <div className="notif-message">{notif.message}</div>
                  <div className="notif-time">{new Date(notif.createdAt).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default Sidebar;

