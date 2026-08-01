import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/axios';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function EmployeeDetail() {
  const { id } = useParams();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const res = await api.get(`/employees/${id}/stats`);
      setStats(res.data);
    } catch (err) {
      setError('Failed to load employee details');
    }
  };

  useEffect(() => {
    fetchStats();
  }, [id]);

  if (error) {
    return (
      <Layout>
        <div className="p-8">
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
        </div>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout>
        <div className="p-8 text-slate-500">Loading...</div>
      </Layout>
    );
  }

  const maxMonthHours = Math.max(...Object.values(stats.year.hours_by_month), 1);

  return (
    <Layout>
      <div className="p-8">
        <Link to="/employees" className="text-blue-600 text-sm hover:underline mb-4 inline-block">
          ← Back to Employees
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{stats.employee.name}</h1>
            <p className="text-slate-500">
              {stats.employee.employee_id} · {stats.employee.email} · {stats.employee.department || 'No department'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            stats.employee.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
            stats.employee.role === 'HR' ? 'bg-amber-100 text-amber-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {stats.employee.role}
          </span>
        </div>

        {/* Today */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Today — {stats.today.date}</h2>
          {stats.today.shift_type ? (
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Shift Type</p>
                <p className="font-semibold text-slate-800">{stats.today.shift_type}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Check In</p>
                <p className="font-semibold text-slate-800">{stats.today.check_in?.slice(0, 5) || '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Check Out</p>
                <p className="font-semibold text-slate-800">{stats.today.check_out?.slice(0, 5) || '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Hours</p>
                <p className="font-semibold text-slate-800">{stats.today.hours}</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No shift entry logged today.</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800">This Month</h2>
              <span className="text-lg font-bold text-[#0a0a2e]">{stats.month.total_hours} hrs</span>
            </div>
            {Object.keys(stats.month.totals_by_type).length === 0 ? (
              <p className="text-slate-400 text-sm">No entries this month.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(stats.month.totals_by_type).map(([type, hours]) => (
                  <div key={type} className="bg-gray-50 rounded-lg p-3 flex justify-between">
                    <span className="text-sm text-slate-600">{type}</span>
                    <span className="text-sm font-semibold text-slate-800">{hours}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leaves */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Leaves ({stats.year.year})</h2>
              <span className="text-lg font-bold text-[#0a0a2e]">{stats.leaves.days_taken_this_year} days</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-amber-50 rounded-lg p-3 text-center">
                <p className="text-xs text-amber-600 mb-1">Pending</p>
                <p className="font-semibold text-amber-700">{stats.leaves.counts_by_status.Pending || 0}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xs text-green-600 mb-1">Approved</p>
                <p className="font-semibold text-green-700">{stats.leaves.counts_by_status.Approved || 0}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-xs text-red-600 mb-1">Rejected</p>
                <p className="font-semibold text-red-700">{stats.leaves.counts_by_status.Rejected || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Yearly */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Yearly Overview ({stats.year.year})</h2>
            <span className="text-lg font-bold text-[#0a0a2e]">{stats.year.total_hours} hrs total</span>
          </div>
          <div className="flex items-end gap-2 h-40">
            {MONTH_NAMES.map((name, i) => {
              const monthNum = i + 1;
              const hours = stats.year.hours_by_month[monthNum] || 0;
              const heightPct = (hours / maxMonthHours) * 100;
              return (
                <div key={monthNum} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full bg-indigo-500 rounded-t"
                    style={{ height: `${heightPct}%`, minHeight: hours > 0 ? '4px' : '0' }}
                    title={`${hours} hrs`}
                  ></div>
                  <p className="text-xs text-slate-500 mt-2">{name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default EmployeeDetail;