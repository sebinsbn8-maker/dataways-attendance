import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { isAdmin } from '../utils/auth';

const SHIFT_TYPES = ['General', 'Morning', 'Evening', 'Night', 'OT', 'Work From Home', 'Half Day', 'Leave'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function MonthlySummary() {
  const admin = isAdmin();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState([]);
  const [error, setError] = useState('');

  const fetchSummary = async () => {
    setError('');
    try {
      const res = await api.get('/shift-entries/summary', { params: { month, year } });
      setSummary(res.data);
    } catch (err) {
      setError('Failed to load monthly summary');
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [month, year]);

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Monthly Summary</h1>
            <p className="text-slate-500">Shift hours totals by month</p>
          </div>

          <div className="flex gap-3">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              {[year - 1, year, year + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {summary.length === 0 && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-slate-500">
            No shift entries found for {MONTH_NAMES[month - 1]} {year}.
          </div>
        )}

        {summary.map((emp) => (
          <div key={emp.employee_id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                {admin ? emp.employee_name : 'Your Summary'}
              </h2>
              <span className="text-lg font-bold text-[#0a0a2e]">
                {emp.total_hours} hrs total
              </span>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {SHIFT_TYPES.map((type) => (
                <div key={type} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">{type}</p>
                  <p className="font-semibold text-slate-800">
                    {emp.totals_by_type[type] || 0}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default MonthlySummary;