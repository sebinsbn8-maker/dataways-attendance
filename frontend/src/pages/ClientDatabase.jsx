import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

const emptyForm = {
  sl_no: '', date: '', usecase: '', client_id: '', client_name: '',
  project_id: '', project_name: '', project_description: '', workflow_details: '',
  timeframe_shared: '', bd_executive: '', poc_coordinator: '', tool_type: '',
  tool_name: '', output_delivered: '', date_of_submission: '', phase: '',
  project_status: '', challenges: '', reason_for_dropping: '', remarks: '',
};

const PROJECT_STATUSES = ['Real Phase', 'Pending', 'Ongoing', 'Dropped', 'Postponed', 'Paid sample', 'Waiting for feedback'];
const PHASES = ['Sample Phase', 'Enquiry Phase'];
const TOOL_TYPES = ['Client Tool', 'Internal Tool'];

function ClientDatabase() {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchEntries = async () => {
    try {
      const res = await api.get('/clients/');
      setEntries(res.data);
    } catch (err) {
      setError('Failed to load client database');
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      ...formData,
      sl_no: formData.sl_no ? parseInt(formData.sl_no) : null,
      date: formData.date || null,
      date_of_submission: formData.date_of_submission || null,
    };
    try {
      if (editingId) {
        await api.put(`/clients/${editingId}`, payload);
      } else {
        await api.post('/clients/', payload);
      }
      resetForm();
      fetchEntries();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save entry');
    }
  };

  const handleEdit = (entry) => {
    const filled = { ...emptyForm };
    Object.keys(filled).forEach((key) => {
      filled[key] = entry[key] !== null && entry[key] !== undefined ? entry[key] : '';
    });
    setFormData(filled);
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api.delete(`/clients/${id}`);
      fetchEntries();
    } catch (err) {
      setError('Failed to delete entry');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Sl No', 'Date', 'Usecase', 'Client ID', 'Client Name', 'Project ID', 'Project Name',
      'Project Description', 'Workflow Details', 'Timeframe Shared', 'BD Executive',
      'POC Coordinator', 'Tool Type', 'Tool Name', 'Output Delivered', 'Date of Submission',
      'Phase', 'Project Status', 'Challenges', 'Reason for Dropping', 'Remarks',
    ];

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = entries.map((e) => [
      e.sl_no, e.date, e.usecase, e.client_id, e.client_name, e.project_id, e.project_name,
      e.project_description, e.workflow_details, e.timeframe_shared, e.bd_executive,
      e.poc_coordinator, e.tool_type, e.tool_name, e.output_delivered, e.date_of_submission,
      e.phase, e.project_status, e.challenges, e.reason_for_dropping, e.remarks,
    ].map(escapeCSV).join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `client_database_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const statusBadge = (status) => {
    const styles = {
      'Real Phase': 'bg-green-100 text-green-700',
      'Pending': 'bg-amber-100 text-amber-700',
      'Ongoing': 'bg-blue-100 text-blue-700',
      'Dropped': 'bg-red-100 text-red-700',
      'Postponed': 'bg-orange-100 text-orange-700',
      'Paid sample': 'bg-purple-100 text-purple-700',
      'Waiting for feedback': 'bg-slate-100 text-slate-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status || '-'}
      </span>
    );
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Client Database</h1>
            <p className="text-slate-500">Track client projects and delivery status</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              disabled={entries.length === 0}
              className="bg-white border border-gray-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⬇ Export CSV
            </button>
            <button
              onClick={() => (showForm ? resetForm() : setShowForm(true))}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : '+ Add Entry'}
            </button>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            <input name="sl_no" type="number" value={formData.sl_no} onChange={handleChange} placeholder="Sl. No." className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <div>
              <label className="block text-xs text-slate-500 mb-1">Date</label>
              <input name="date" type="date" value={formData.date} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <input name="usecase" value={formData.usecase} onChange={handleChange} placeholder="Usecase (Type of Project)" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="client_id" value={formData.client_id} onChange={handleChange} placeholder="Client ID" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="client_name" value={formData.client_name} onChange={handleChange} placeholder="Client Name" required className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="project_id" value={formData.project_id} onChange={handleChange} placeholder="Project ID" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="project_name" value={formData.project_name} onChange={handleChange} placeholder="Project Name" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="timeframe_shared" value={formData.timeframe_shared} onChange={handleChange} placeholder="Timeframe Shared" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="bd_executive" value={formData.bd_executive} onChange={handleChange} placeholder="BD Executive" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="poc_coordinator" value={formData.poc_coordinator} onChange={handleChange} placeholder="POC Coordinator" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <select name="tool_type" value={formData.tool_type} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="">Tool Type</option>
              {TOOL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input name="tool_name" value={formData.tool_name} onChange={handleChange} placeholder="Tool Name" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <select name="output_delivered" value={formData.output_delivered} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="">Output Delivered?</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Date of Submission</label>
              <input name="date_of_submission" type="date" value={formData.date_of_submission} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <select name="phase" value={formData.phase} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="">Phase</option>
              {PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select name="project_status" value={formData.project_status} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="">Project Status</option>
              {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <textarea name="project_description" value={formData.project_description} onChange={handleChange} placeholder="Project Description" className="border border-gray-200 rounded-lg px-3 py-2 text-sm col-span-2 md:col-span-3" rows="2" />
            <textarea name="workflow_details" value={formData.workflow_details} onChange={handleChange} placeholder="Workflow Details" className="border border-gray-200 rounded-lg px-3 py-2 text-sm col-span-2 md:col-span-3" rows="2" />
            <textarea name="challenges" value={formData.challenges} onChange={handleChange} placeholder="Challenges" className="border border-gray-200 rounded-lg px-3 py-2 text-sm col-span-2 md:col-span-3" rows="2" />
            <textarea name="reason_for_dropping" value={formData.reason_for_dropping} onChange={handleChange} placeholder="Reason for Dropping" className="border border-gray-200 rounded-lg px-3 py-2 text-sm col-span-2 md:col-span-3" rows="2" />
            <textarea name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Remarks" className="border border-gray-200 rounded-lg px-3 py-2 text-sm col-span-2 md:col-span-3" rows="2" />
            <button type="submit" className="col-span-2 md:col-span-3 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700">
              {editingId ? 'Update Entry' : 'Save Entry'}
            </button>
          </form>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[2000px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-3 font-medium text-slate-500">Sl No</th>
                <th className="p-3 font-medium text-slate-500">Date</th>
                <th className="p-3 font-medium text-slate-500">Usecase</th>
                <th className="p-3 font-medium text-slate-500">Client ID</th>
                <th className="p-3 font-medium text-slate-500">Client Name</th>
                <th className="p-3 font-medium text-slate-500">Project ID</th>
                <th className="p-3 font-medium text-slate-500">Project Name</th>
                <th className="p-3 font-medium text-slate-500">Description</th>
                <th className="p-3 font-medium text-slate-500">Workflow</th>
                <th className="p-3 font-medium text-slate-500">Timeframe</th>
                <th className="p-3 font-medium text-slate-500">BD Executive</th>
                <th className="p-3 font-medium text-slate-500">POC Coordinator</th>
                <th className="p-3 font-medium text-slate-500">Tool Type</th>
                <th className="p-3 font-medium text-slate-500">Tool Name</th>
                <th className="p-3 font-medium text-slate-500">Output Delivered</th>
                <th className="p-3 font-medium text-slate-500">Submission Date</th>
                <th className="p-3 font-medium text-slate-500">Phase</th>
                <th className="p-3 font-medium text-slate-500">Status</th>
                <th className="p-3 font-medium text-slate-500">Challenges</th>
                <th className="p-3 font-medium text-slate-500">Reason for Dropping</th>
                <th className="p-3 font-medium text-slate-500">Remarks</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="p-3 text-slate-700">{e.sl_no || '-'}</td>
                  <td className="p-3 text-slate-500">{e.date || '-'}</td>
                  <td className="p-3 text-slate-500">{e.usecase || '-'}</td>
                  <td className="p-3 text-slate-500">{e.client_id || '-'}</td>
                  <td className="p-3 text-slate-700 font-medium">{e.client_name}</td>
                  <td className="p-3 text-slate-500">{e.project_id || '-'}</td>
                  <td className="p-3 text-slate-500">{e.project_name || '-'}</td>
                  <td className="p-3 text-slate-500 max-w-xs truncate" title={e.project_description}>{e.project_description || '-'}</td>
                  <td className="p-3 text-slate-500 max-w-xs truncate" title={e.workflow_details}>{e.workflow_details || '-'}</td>
                  <td className="p-3 text-slate-500">{e.timeframe_shared || '-'}</td>
                  <td className="p-3 text-slate-500">{e.bd_executive || '-'}</td>
                  <td className="p-3 text-slate-500">{e.poc_coordinator || '-'}</td>
                  <td className="p-3 text-slate-500">{e.tool_type || '-'}</td>
                  <td className="p-3 text-slate-500">{e.tool_name || '-'}</td>
                  <td className="p-3 text-slate-500">{e.output_delivered || '-'}</td>
                  <td className="p-3 text-slate-500">{e.date_of_submission || '-'}</td>
                  <td className="p-3 text-slate-500">{e.phase || '-'}</td>
                  <td className="p-3">{statusBadge(e.project_status)}</td>
                  <td className="p-3 text-slate-500 max-w-xs truncate" title={e.challenges}>{e.challenges || '-'}</td>
                  <td className="p-3 text-slate-500 max-w-xs truncate" title={e.reason_for_dropping}>{e.reason_for_dropping || '-'}</td>
                  <td className="p-3 text-slate-500 max-w-xs truncate" title={e.remarks}>{e.remarks || '-'}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(e)} className="text-blue-600 hover:text-blue-700 text-xs font-medium">Edit</button>
                      <button onClick={() => handleDelete(e.id)} className="text-red-600 hover:text-red-700 text-xs font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr><td colSpan="22" className="p-4 text-center text-slate-400">No entries yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export default ClientDatabase;