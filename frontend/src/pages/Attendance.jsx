import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

function Attendance() {
  const [today, setToday] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchToday = async () => {
    try {
      const res = await api.get('/attendance/today');
      setToday(res.data);
    } catch (err) {
      setError('Failed to load attendance status');
    }
  };

  useEffect(() => {
    fetchToday();
  }, []);

  const handleCheckIn = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/attendance/check-in');
      setToday(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/attendance/check-out');
      setToday(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Attendance</h1>
        <p className="text-slate-500 mb-8">{new Date().toDateString()}</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-md">
          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Check In</p>
              <p className="font-semibold text-slate-800">{today?.check_in?.slice(0, 8) || '--:--:--'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Check Out</p>
              <p className="font-semibold text-slate-800">{today?.check_out?.slice(0, 8) || '--:--:--'}</p>
            </div>
          </div>

          {today?.working_hours != null && (
            <p className="text-sm text-slate-600 mb-6">
              Working hours today: <span className="font-semibold">{today.working_hours} hrs</span>
            </p>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleCheckIn}
              disabled={loading || today?.check_in}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 transition"
            >
              Check In
            </button>
            <button
              onClick={handleCheckOut}
              disabled={loading || !today?.check_in || today?.check_out}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 transition"
            >
              Check Out
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Attendance;