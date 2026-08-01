import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

function Shifts() {
  const [shifts, setShifts] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ shift_name: '', start_time: '', end_time: '' });

  const fetchShifts = async () => {
    try {
      const res = await api.get('/shifts/');
      setShifts(res.data);
    } catch (err) {
      setError('Failed to load shifts');
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/shifts/', {
        shift_name: formData.shift_name,
        start_time: formData.start_time + ':00',
        end_time: formData.end_time + ':00',
      });
      setFormData({ shift_name: '', start_time: '', end_time: '' });
      setShowForm(false);
      fetchShifts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create shift');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this shift?')) return;
    try {
      await api.delete(`/shifts/${id}`);
      fetchShifts();
    } catch (err) {
      setError('Failed to delete shift');
    }
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Shifts</h1>
            <p className="text-slate-500">Manage work shifts</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : '+ Add Shift'}
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 grid grid-cols-3 gap-4">
            <input name="shift_name" value={formData.shift_name} onChange={handleChange} placeholder="Shift Name (e.g. Day Shift)" required className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input name="start_time" type="time" value={formData.start_time} onChange={handleChange} required className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input name="end_time" type="time" value={formData.end_time} onChange={handleChange} required className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" className="col-span-3 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition">
              Create Shift
            </button>
          </form>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-medium text-slate-500">Shift Name</th>
                <th className="p-4 font-medium text-slate-500">Start Time</th>
                <th className="p-4 font-medium text-slate-500">End Time</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr key={shift.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="p-4 text-slate-700 font-medium">{shift.shift_name}</td>
                  <td className="p-4 text-slate-500">{shift.start_time?.slice(0, 5)}</td>
                  <td className="p-4 text-slate-500">{shift.end_time?.slice(0, 5)}</td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(shift.id)} className="text-red-600 hover:underline text-xs font-medium">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export default Shifts;