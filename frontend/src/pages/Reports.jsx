import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

function Reports() {
  const [employees, setEmployees] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/employees/').then((res) => setEmployees(res.data)).catch(() => {});
  }, []);

  const handleDownload = async () => {
    setError('');
    if (!startDate || !endDate) {
      setError('Please select both a start and end date');
      return;
    }
    setLoading(true);
    try {
      const params = { start_date: startDate, end_date: endDate };
      if (employeeId) params.employee_id = employeeId;

      const res = await api.get('/reports/export', {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dataways_report_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Reports</h1>
        <p className="text-slate-500 mb-8">Export attendance and leave records as CSV</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-lg">
          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

          <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <label className="block text-sm font-medium text-slate-700 mb-1">Employee (optional)</label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name} ({emp.employee_id})</option>
            ))}
          </select>

          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full bg-[#0a0a2e] text-white py-2.5 rounded-lg font-medium hover:bg-[#14143f] transition disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Download CSV'}
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default Reports;