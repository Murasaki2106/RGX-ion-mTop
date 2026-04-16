import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

function Layout({ onLogout }) {
  return (
    <div className="app-container">
      <Sidebar onLogout={onLogout} />
      <main className="main-content">
        <TopBar onLogout={onLogout} />
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;


