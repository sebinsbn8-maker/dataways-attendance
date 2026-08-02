import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { isAdmin } from '../utils/auth';

const SHIFT_TYPES = ['General', 'Morning', 'Evening', 'Night', 'OT', 'Work From Home', 'Half Day', 'Leave'];
const FIXED_HOURS = { General: 7, Morning: 7, Evening: 7, Night: 7, 'Half Day': 3.5, Leave: 0 };
const MANUAL_TYPES = ['OT', 'Work From Home'];

function formatTime(t) {
  if (!t) return null;
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m} ${ampm}`;
}

function ShiftLog() {
  const admin = isAdmin();
  const [entries, setEntries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    employee_id: '',
    date: new Date().toISOString().slice(0, 10),
    shift_type: 'General',
    check_in: '',
    check_out: '',
    manual_hours: '',
    project_name: '',
    system_type: 'Office',
    remarks: '',
  };
  const [formData, setFormData] = useState(emptyForm);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  const fetchEntries = async () => {
    try {
      const url = admin ? '/shift-entries/' : '/shift-entries/my';
      const params = admin && selectedEmployeeId ? { employee_id: selectedEmployeeId } : {};
      const res = await api.get(url, { params });
      setEntries(res.data);
    } catch (err) {
      setError('Failed to load shift entries');
    }
  };

  const fetchEmployees = async () => {
    if (!admin) return;
    try {
      const res = await api.get('/employees/');
      setEmployees(res.data);
    } catch (err) {
      // ignore
    }
  };

  const fetchProjects = async (forEmployeeId) => {
    try {
      const params = forEmployeeId ? { employee_id: forEmployeeId } : {};
      const res = await api.get('/projects/assigned', { params });
      setProjects(res.data);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (admin) {
      fetchProjects(formData.employee_id || null);
    }
  }, [formData.employee_id]);

  useEffect(() => {
    fetchEntries();
  }, [selectedEmployeeId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        date: formData.date,
        shift_type: formData.shift_type,
        check_in: formData.check_in || null,
        check_out: formData.check_out || null,
        manual_hours: MANUAL_TYPES.includes(formData.shift_type)
          ? parseFloat(formData.manual_hours || 0)
          : null,
        project_name: formData.project_name || null,
        system_type: formData.system_type || null,
        remarks: formData.remarks || null,
      };
      if (admin && formData.employee_id) {
        payload.employee_id = parseInt(formData.employee_id);
      }

      if (editingId) {
        await api.put(`/shift-entries/${editingId}`, payload);
      } else {
        await api.post('/shift-entries/', payload);
      }
      resetForm();
      fetchEntries();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save entry');
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setFormData({
      employee_id: entry.employee_id,
      date: entry.date,
      shift_type: entry.shift_type,
      check_in: entry.check_in || '',
      check_out: entry.check_out || '',
      manual_hours: MANUAL_TYPES.includes(entry.shift_type) ? entry.hours : '',
      project_name: entry.project_name || '',
      system_type: entry.system_type || '',
      remarks: entry.remarks || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api.delete(`/shift-entries/${id}`);
      fetchEntries();
    } catch (err) {
      setError('Failed to delete entry');
    }
  };

  const isManualHours = MANUAL_TYPES.includes(formData.shift_type);

  return (
    <Layout>
      <div className="p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">Shift Log</h1>
            <p className="text-sm sm:text-base text-slate-500">Daily shift entries and hours</p>
          </div>

          {admin && (
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          )}
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {admin && (
              <select name="employee_id" value={formData.employee_id} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 w-full">
                <option value="">Myself</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            )}

            <input type="date" name="date" value={formData.date} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 w-full" required />

            <select name="shift_type" value={formData.shift_type} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 w-full">
              {SHIFT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {isManualHours ? (
              <input type="number" step="0.5" name="manual_hours" value={formData.manual_hours} onChange={handleChange} placeholder="Hours" className="border border-gray-200 rounded-lg px-3 py-2 w-full" required />
            ) : (
              <div className="flex items-center px-3 py-2 text-sm text-slate-500 bg-gray-50 rounded-lg">
                {FIXED_HOURS[formData.shift_type]} hrs (auto)
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Start Time</label>
              <input type="time" name="check_in" value={formData.check_in} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">End Time</label>
              <input type="time" name="check_out" value={formData.check_out} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 w-full" />
            </div>

            <select name="system_type" value={formData.system_type} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 w-full">
              <option value="Office">Office System</option>
              <option value="Personal">Personal System</option>
            </select>

            <select name="project_name" value={formData.project_name} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 w-full">
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          <input name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Remarks" className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4" />

          <div className="flex gap-3">
            <button type="submit" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
              {editingId ? 'Update Entry' : 'Add Entry'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Desktop table */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-medium text-slate-500">Date</th>
                {admin && <th className="p-4 font-medium text-slate-500">Employee</th>}
                <th className="p-4 font-medium text-slate-500">Shift</th>
                <th className="p-4 font-medium text-slate-500">Check In</th>
                <th className="p-4 font-medium text-slate-500">Check Out</th>
                <th className="p-4 font-medium text-slate-500">Hours</th>
                <th className="p-4 font-medium text-slate-500">Project</th>
                <th className="p-4 font-medium text-slate-500">System</th>
                <th className="p-4 font-medium text-slate-500">Remarks</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="p-4 text-slate-700">{e.date}</td>
                  {admin && <td className="p-4 text-slate-700">{e.employee_name}</td>}
                  <td className="p-4 text-slate-700">{e.shift_type}</td>
                  <td className="p-4 text-slate-500">{formatTime(e.check_in) || '—'}</td>
                  <td className="p-4 text-slate-500">{formatTime(e.check_out) || '—'}</td>
                  <td className="p-4 font-medium text-slate-800">{e.hours}</td>
                  <td className="p-4 text-slate-500">{e.project_name || '—'}</td>
                  <td className="p-4 text-slate-500">{e.system_type || '—'}</td>
                  <td className="p-4 text-slate-500">{e.remarks || '—'}</td>
                  <td className="p-4 flex gap-3">
                    <button onClick={() => handleEdit(e)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                    <button onClick={() => handleDelete(e.id)} className="text-red-600 hover:text-red-700 text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile / tablet cards */}
        <div className="lg:hidden space-y-3">
          {entries.map((e) => (
            <div key={e.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-slate-800">{e.date}</p>
                  {admin && <p className="text-xs text-slate-500">{e.employee_name}</p>}
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {e.shift_type}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-y-1 text-xs text-slate-500 mb-3">
                <p>In: {formatTime(e.check_in) || '—'}</p>
                <p>Out: {formatTime(e.check_out) || '—'}</p>
                <p>Hours: <span className="font-medium text-slate-800">{e.hours}</span></p>
                <p>System: {e.system_type || '—'}</p>
                {e.project_name && <p className="col-span-2">Project: {e.project_name}</p>}
                {e.remarks && <p className="col-span-2">Remarks: {e.remarks}</p>}
              </div>
              <div className="flex gap-4">
                <button onClick={() => handleEdit(e)} className="text-blue-600 text-xs font-medium">Edit</button>
                <button onClick={() => handleDelete(e.id)} className="text-red-600 text-xs font-medium">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default ShiftLog;