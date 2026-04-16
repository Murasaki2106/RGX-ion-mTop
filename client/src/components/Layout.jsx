import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

function Layout({ userRole, userEmail, onLogout }) {
  return (
    <div className="app-container">
      <Sidebar userRole={userRole} onLogout={onLogout} />
      <main className="main-content">
        <TopBar userEmail={userEmail} onLogout={onLogout} />
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;


