import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/axios';
import { isAdmin } from '../utils/auth';

function Employees() {
  const [employees, setEmployees] = useState([]);
  const admin = isAdmin();
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', department: '', role: 'Employee', shift: ''
  });

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees/');
      setEmployees(res.data);
    } catch (err) {
      setError('Failed to load employees');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/employees/', formData);
      setFormData({ name: '', email: '', password: '', department: '', role: 'Employee', shift: '' });
      setShowForm(false);
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create employee');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    try {
      await api.delete(`/employees/${id}`);
      fetchEmployees();
    } catch (err) {
      setError('Failed to delete employee');
    }
  };

  const handleResetPassword = async (id, name) => {
    const newPassword = window.prompt(`Enter new password for ${name}:`);
    if (!newPassword) return;
    try {
      await api.put(`/employees/${id}/reset-password`, { new_password: newPassword });
      alert('Password reset successfully.');
    } catch (err) {
      setError('Failed to reset password');
    }
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Employees</h1>
            <p className="text-slate-500">Manage your team</p>
          </div>
          {admin && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              {showForm ? 'Cancel' : '+ Add Employee'}
            </button>
          )}
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {showForm && admin && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 grid grid-cols-2 gap-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" required className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input name="department" value={formData.department} onChange={handleChange} placeholder="Department" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select name="role" value={formData.role} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Employee">Employee</option>
              <option value="HR">HR</option>
              <option value="Admin">Admin</option>
            </select>
            <input name="shift" value={formData.shift} onChange={handleChange} placeholder="Shift" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" className="col-span-2 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition">
              Create Employee
            </button>
          </form>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-medium text-slate-500">ID</th>
                <th className="p-4 font-medium text-slate-500">Name</th>
                <th className="p-4 font-medium text-slate-500">Email</th>
                <th className="p-4 font-medium text-slate-500">Department</th>
                <th className="p-4 font-medium text-slate-500">Role</th>
                <th className="p-4 font-medium text-slate-500">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="p-4 text-slate-700">{emp.employee_id}</td>
                  <td className="p-4 text-slate-700 font-medium">
                    <Link to={`/employees/${emp.id}`} className="hover:underline hover:text-blue-600">
                      {emp.name}
                    </Link>
                  </td>
                  <td className="p-4 text-slate-500">{emp.email}</td>
                  <td className="p-4 text-slate-500">{emp.department}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      emp.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                      emp.role === 'HR' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {emp.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {admin && (
                      <div className="flex gap-3">
                        <button onClick={() => handleResetPassword(emp.id, emp.name)} className="text-indigo-600 hover:underline text-xs font-medium">
                          Reset Password
                        </button>
                        <button onClick={() => handleDelete(emp.id)} className="text-red-600 hover:underline text-xs font-medium">
                          Delete
                        </button>
                      </div>
                    )}
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

export default Employees;