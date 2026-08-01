import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

function Leaves() {
  const [myLeaves, setMyLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ start_date: '', end_date: '', reason: '' });
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchLeaves = async () => {
    try {
      const mine = await api.get('/leaves/my');
      setMyLeaves(mine.data);
    } catch (err) {
      setError('Failed to load your leaves');
    }
    try {
      const all = await api.get('/leaves/');
      setAllLeaves(all.data);
      setIsAdmin(true);
    } catch (err) {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/leaves/', formData);
      setFormData({ start_date: '', end_date: '', reason: '' });
      setShowForm(false);
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to apply for leave');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/leaves/${id}/status`, { status });
      fetchLeaves();
    } catch (err) {
      setError('Failed to update leave status');
    }
  };

  const statusBadge = (status) => {
    const styles = {
      Pending: 'bg-amber-100 text-amber-700',
      Approved: 'bg-green-100 text-green-700',
      Rejected: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || ''}`}>
        {status}
      </span>
    );
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Leaves</h1>
            <p className="text-slate-500">Apply for and manage leave requests</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Apply for Leave'}
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 grid grid-cols-3 gap-4">
            <input name="start_date" type="date" value={formData.start_date} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2" required />
            <input name="end_date" type="date" value={formData.end_date} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2" required />
            <input name="reason" value={formData.reason} onChange={handleChange} placeholder="Reason" className="border border-gray-200 rounded-lg px-3 py-2" />
            <button type="submit" className="col-span-3 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700">
              Submit Request
            </button>
          </form>
        )}

        <h2 className="text-lg font-semibold text-slate-800 mb-3">My Leave Requests</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-medium text-slate-500">Start Date</th>
                <th className="p-4 font-medium text-slate-500">End Date</th>
                <th className="p-4 font-medium text-slate-500">Reason</th>
                <th className="p-4 font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {myLeaves.map((leave) => (
                <tr key={leave.id} className="border-b border-gray-50 last:border-0">
                  <td className="p-4 text-slate-700">{leave.start_date}</td>
                  <td className="p-4 text-slate-700">{leave.end_date}</td>
                  <td className="p-4 text-slate-500">{leave.reason || '-'}</td>
                  <td className="p-4">{statusBadge(leave.status)}</td>
                </tr>
              ))}
              {myLeaves.length === 0 && (
                <tr><td colSpan="4" className="p-4 text-center text-slate-400">No leave requests yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {isAdmin && (
          <>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">All Leave Requests</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-medium text-slate-500">Employee Name</th>
                    <th className="p-4 font-medium text-slate-500">Start Date</th>
                    <th className="p-4 font-medium text-slate-500">End Date</th>
                    <th className="p-4 font-medium text-slate-500">Reason</th>
                    <th className="p-4 font-medium text-slate-500">Status</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {allLeaves.map((leave) => (
                    <tr key={leave.id} className="border-b border-gray-50 last:border-0">
                      <td className="p-4 text-slate-700">{leave.employee_name}</td>
                      <td className="p-4 text-slate-700">{leave.start_date}</td>
                      <td className="p-4 text-slate-700">{leave.end_date}</td>
                      <td className="p-4 text-slate-500">{leave.reason || '-'}</td>
                      <td className="p-4">{statusBadge(leave.status)}</td>
                      <td className="p-4">
                        {leave.status === 'Pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleStatusUpdate(leave.id, 'Approved')} className="text-green-600 hover:text-green-700 text-sm font-medium">
                              Approve
                            </button>
                            <button onClick={() => handleStatusUpdate(leave.id, 'Rejected')} className="text-red-600 hover:text-red-700 text-sm font-medium">
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default Leaves;