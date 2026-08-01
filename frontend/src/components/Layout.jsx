import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAdmin, getUserName } from '../utils/auth';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = isAdmin();
  const userName = getUserName();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/shift-log', label: 'Shift Log', icon: '📋' },
    { path: '/monthly-summary', label: 'Monthly Summary', icon: '📊' },
    { path: '/employees', label: 'Employees', icon: '👥', adminOnly: true },
    { path: '/shifts', label: 'Shifts', icon: '📅', adminOnly: true },
    { path: '/leaves', label: 'Leaves', icon: '📝' },
    { path: '/reports', label: 'Reports', icon: '📈', adminOnly: true },
  ];

  const visibleNavItems = navItems.filter((item) => !item.adminOnly || admin);

  return (
    <div className="min-h-screen flex bg-[#f5f6fb]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a2e] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold text-white">Dataways</h1>
          <p className="text-xs text-indigo-300/60 mt-1">Attendance System</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {visibleNavItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
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
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

export default Layout;