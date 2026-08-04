import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAdmin, getUserName } from '../utils/auth';
import NotificationBell from './NotificationBell';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = isAdmin();
  const userName = getUserName();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/overview', label: 'Overview', icon: '📊', adminOnly: true },
    { path: '/shift-log', label: 'Shift Log', icon: '📋' },
    { path: '/monthly-summary', label: 'Monthly Summary', icon: '📊' },
    { path: '/employees', label: 'Employees', icon: '👥', adminOnly: true },
    { path: '/shifts', label: 'Shifts', icon: '📅', adminOnly: true },
    { path: '/leaves', label: 'Leaves', icon: '📝' },
    { path: '/my-projects', label: 'My Project', icon: '🗂️' },
    { path: '/reports', label: 'Reports', icon: '📈', adminOnly: true },
    { path: '/projects', label: 'Projects', icon: '🗂️', adminOnly: true },
    { path: '/contributors', label: 'Contributor DB', icon: '🏢', adminOnly: true },
    { path: '/clients', label: 'Client DB', icon: '📁', adminOnly: true },
  ];

  const visibleNavItems = navItems.filter((item) => !item.adminOnly || admin);

  const handleNavClick = () => setMobileOpen(false);

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dataways</h1>
          <p className="text-xs text-indigo-300/60 mt-1">Attendance System</p>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-indigo-200/80 hover:text-white text-xl leading-none"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {visibleNavItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-indigo-200/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        {userName && (
          <p className="px-4 pb-3 text-sm text-indigo-200/80">
            Signed in as <span className="font-medium text-white">{userName}</span>
          </p>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-indigo-200/80 hover:bg-white/5 hover:text-white"
        >
          <span>🚪</span>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-[#f5f6fb]">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#0a0a2e] text-white flex items-center justify-between px-4 z-30">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-xl leading-none"
          aria-label="Open menu"
        >
          ☰
        </button>
        <span className="font-bold">Dataways</span>
        <NotificationBell />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — fixed/slide-in on mobile, static on desktop */}
      <aside
        className={`w-64 bg-[#0a0a2e] text-white flex flex-col fixed top-0 bottom-0 left-0 z-50 transform transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0 flex flex-col">
        {/* Desktop top bar */}
        <div className="hidden lg:flex justify-end items-center px-8 py-3 border-b border-gray-100 bg-white">
          <NotificationBell />
        </div>
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}

export default Layout;