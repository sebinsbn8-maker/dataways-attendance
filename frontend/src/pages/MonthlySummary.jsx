import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { isAdmin } from '../utils/auth';

const SHIFT_TYPES = ['General', 'General + OT', 'Morning', 'Evening', 'Night', 'OT', 'Work From Home', 'Half Day', 'Half Day + OT', 'Leave'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const TYPE_STYLES = {
  General: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'General + OT': 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
  Morning: 'bg-amber-50 text-amber-700 border-amber-100',
  Evening: 'bg-orange-50 text-orange-700 border-orange-100',
  Night: 'bg-violet-50 text-violet-700 border-violet-100',
  OT: 'bg-rose-50 text-rose-700 border-rose-100',
  'Work From Home': 'bg-teal-50 text-teal-700 border-teal-100',
  'Half Day': 'bg-sky-50 text-sky-700 border-sky-100',
  'Half Day + OT': 'bg-cyan-50 text-cyan-700 border-cyan-100',
  Leave: 'bg-slate-100 text-slate-600 border-slate-200',
};

function formatShift(totalHours) {
  const shifts = totalHours / 7;
  const rounded = Math.round(shifts * 100) / 100;
  return rounded.toString();
}

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
      <div className="p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">Monthly Summary</h1>
            <p className="text-sm sm:text-base text-slate-500">Shift hours totals by month</p>
          </div>
          <div className="flex gap-3">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 sm:flex-none"
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 sm:flex-none"
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
          <div key={emp.employee_id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
            <div className="bg-gradient-to-r from-[#0a0a2e] to-indigo-900 px-4 sm:px-6 py-4 flex justify-between items-center">
              <h2 className="text-base sm:text-lg font-semibold text-white">
                {admin ? emp.employee_name : 'Your Summary'}
              </h2>
              <span className="text-base sm:text-lg font-bold text-white bg-white/10 px-3 py-1 rounded-full">
                {emp.total_hours} hrs
              </span>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
                <div className="rounded-lg p-3 text-center border bg-green-50 text-green-700 border-green-100">
                  <p className="text-xs font-medium mb-1">Total Shift</p>
                  <p className="font-bold text-lg">{formatShift(emp.total_hours)}</p>
                </div>
                {SHIFT_TYPES.map((type) => (
                  <div key={type} className={`rounded-lg p-3 text-center border ${TYPE_STYLES[type]}`}>
                    <p className="text-xs font-medium mb-1">{type}</p>
                    <p className="font-bold text-lg">
                      {emp.totals_by_type[type] || 0}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default MonthlySummary;