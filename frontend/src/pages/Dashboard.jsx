import Layout from '../components/Layout';
import { getUserName, isAdmin } from '../utils/auth';

function Dashboard() {
  const userName = getUserName();
  const admin = isAdmin();

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Dashboard</h1>
        {userName && (
          <p className="text-xl font-bold text-[#0a0a2e] mb-1">Welcome, {userName}</p>
        )}
        <p className="text-slate-500 mb-8">Welcome back to Dataways Attendance System</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-slate-500 mb-1">Quick Action</p>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Log Your Shift</h2>
            <a href="/shift-log" className="text-blue-600 text-sm font-medium hover:underline">
              Go to Shift Log →
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-slate-500 mb-1">Quick Action</p>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              {admin ? 'Manage Team' : 'View Employees'}
            </h2>
            <a href="/employees" className="text-blue-600 text-sm font-medium hover:underline">
              Go to Employees →
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;