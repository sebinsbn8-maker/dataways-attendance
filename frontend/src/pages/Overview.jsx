import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function Overview() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const fetchOverview = async () => {
    setError('');
    try {
      const res = await api.get('/overview/', { params: { month, year } });
      setData(res.data);
    } catch (err) {
      setError('Failed to load overview');
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [month, year]);

  return (
    <Layout>
      <div className="p-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Overview</h1>
            <p className="text-slate-500">Company-wide stats and analytics</p>
          </div>
          <div className="flex gap-3">
            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              {MONTH_NAMES.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              {[year - 1, year, year + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {!data ? (
          <p className="text-slate-500">Loading...</p>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs text-slate-500 mb-1">Total Employees</p>
                <p className="text-2xl font-bold text-slate-800">{data.employee_hours.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs text-slate-500 mb-1">Contributors Added</p>
                <p className="text-2xl font-bold text-slate-800">{data.contributors.total_count}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs text-slate-500 mb-1">Active Projects</p>
                <p className="text-2xl font-bold text-slate-800">{data.projects.active_count}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs text-slate-500 mb-1">Total Projects</p>
                <p className="text-2xl font-bold text-slate-800">{data.projects.total_count}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Employee hours */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Work Hours — {MONTH_NAMES[month - 1]} {year}
                </h2>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {data.employee_hours.length === 0 ? (
                    <p className="text-slate-400 text-sm">No data for this period.</p>
                  ) : (
                    data.employee_hours.map((e) => (
                      <div key={e.employee_id} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{e.name}</p>
                          <p className="text-xs text-slate-400">{e.employee_code} · {e.department || 'No department'}</p>
                        </div>
                        <span className="text-sm font-bold text-[#0a0a2e]">{e.total_hours} hrs</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Project status breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Project Status</h2>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-green-600 mb-1">Active</p>
                    <p className="text-xl font-bold text-green-700">{data.projects.active_count}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-blue-600 mb-1">Completed</p>
                    <p className="text-xl font-bold text-blue-700">{data.projects.completed_count}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-amber-600 mb-1">On Hold</p>
                    <p className="text-xl font-bold text-amber-700">{data.projects.on_hold_count}</p>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-slate-600 mb-2">Hours by Project ({MONTH_NAMES[month - 1]})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {data.projects.hours_by_project.length === 0 ? (
                    <p className="text-slate-400 text-sm">No projects yet.</p>
                  ) : (
                    data.projects.hours_by_project.map((p) => (
                      <div key={p.project_id} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{p.project_name}</p>
                          <p className="text-xs text-slate-400">{p.status}</p>
                        </div>
                        <span className="text-sm font-bold text-[#0a0a2e]">{p.total_hours} hrs</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Contributors detail */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-800">Contributors</h2>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600 font-medium">{data.contributors.interested_count} Interested</span>
                  <span className="text-red-600 font-medium">{data.contributors.not_interested_count} Not Interested</span>
                </div>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-3 font-medium text-slate-500">Company</th>
                    <th className="p-3 font-medium text-slate-500">Industry</th>
                    <th className="p-3 font-medium text-slate-500">Status</th>
                    <th className="p-3 font-medium text-slate-500">Visit Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.contributors.details.length === 0 ? (
                    <tr><td colSpan="4" className="p-4 text-center text-slate-400">No contributors yet</td></tr>
                  ) : (
                    data.contributors.details.map((c) => (
                      <tr key={c.id} className="border-b border-gray-50 last:border-0">
                        <td className="p-3 text-slate-700 font-medium">{c.company_name}</td>
                        <td className="p-3 text-slate-500">{c.industry_type || '-'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            c.participation_status === 'Interested' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {c.participation_status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{c.field_visited_date || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default Overview;