import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

const emptyForm = {
  company_name: '', process: '', industry_type: '', location: '', state: '',
  contact_number: '', contact_person_name: '', contact_person_designation: '',
  number_of_employees: '', participation_status: 'Interested', infolks_contact_person: '',
  referred_by: '', remarks: '', estimated_amount: '', field_visited_date: '',
};

function ContributorDatabase() {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchEntries = async () => {
    try {
      const res = await api.get('/contributors/');
      setEntries(res.data);
    } catch (err) {
      setError('Failed to load contributor database');
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
    const payload = { ...formData, field_visited_date: formData.field_visited_date || null };
    try {
      if (editingId) {
        await api.put(`/contributors/${editingId}`, payload);
      } else {
        await api.post('/contributors/', payload);
      }
      resetForm();
      fetchEntries();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save entry');
    }
  };

  const handleEdit = (entry) => {
    setFormData({
      company_name: entry.company_name || '',
      process: entry.process || '',
      industry_type: entry.industry_type || '',
      location: entry.location || '',
      state: entry.state || '',
      contact_number: entry.contact_number || '',
      contact_person_name: entry.contact_person_name || '',
      contact_person_designation: entry.contact_person_designation || '',
      number_of_employees: entry.number_of_employees || '',
      participation_status: entry.participation_status || 'Interested',
      infolks_contact_person: entry.infolks_contact_person || '',
      referred_by: entry.referred_by || '',
      remarks: entry.remarks || '',
      estimated_amount: entry.estimated_amount || '',
      field_visited_date: entry.field_visited_date || '',
    });
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api.delete(`/contributors/${id}`);
      fetchEntries();
    } catch (err) {
      setError('Failed to delete entry');
    }
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Contributor Database</h1>
            <p className="text-slate-500">Track prospective companies and contacts</p>
          </div>
          <button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Add Entry'}
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            <input name="company_name" value={formData.company_name} onChange={handleChange} placeholder="Company Name" required className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="process" value={formData.process} onChange={handleChange} placeholder="Process (what they do)" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="industry_type" value={formData.industry_type} onChange={handleChange} placeholder="Type of Industry" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="state" value={formData.state} onChange={handleChange} placeholder="State" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="contact_number" value={formData.contact_number} onChange={handleChange} placeholder="Contact Number" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="contact_person_name" value={formData.contact_person_name} onChange={handleChange} placeholder="Contact Person Name" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="contact_person_designation" value={formData.contact_person_designation} onChange={handleChange} placeholder="Contact Person Designation" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="number_of_employees" value={formData.number_of_employees} onChange={handleChange} placeholder="Number of Employees" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <select name="participation_status" value={formData.participation_status} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="Interested">Interested</option>
              <option value="Not Interested">Not Interested</option>
            </select>
            <input name="infolks_contact_person" value={formData.infolks_contact_person} onChange={handleChange} placeholder="Contact Person from Infolks" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="referred_by" value={formData.referred_by} onChange={handleChange} placeholder="Referred By" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="estimated_amount" value={formData.estimated_amount} onChange={handleChange} placeholder="Estimated Amount" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <div>
              <label className="block text-xs text-slate-500 mb-1">Field Visited Date</label>
              <input name="field_visited_date" type="date" value={formData.field_visited_date} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <textarea name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Remarks" className="border border-gray-200 rounded-lg px-3 py-2 text-sm col-span-2 md:col-span-3" rows="2" />
            <button type="submit" className="col-span-2 md:col-span-3 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700">
              {editingId ? 'Update Entry' : 'Save Entry'}
            </button>
          </form>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[1400px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-3 font-medium text-slate-500">Company</th>
                <th className="p-3 font-medium text-slate-500">Process</th>
                <th className="p-3 font-medium text-slate-500">Industry</th>
                <th className="p-3 font-medium text-slate-500">Location</th>
                <th className="p-3 font-medium text-slate-500">State</th>
                <th className="p-3 font-medium text-slate-500">Contact No.</th>
                <th className="p-3 font-medium text-slate-500">Contact Person</th>
                <th className="p-3 font-medium text-slate-500">Designation</th>
                <th className="p-3 font-medium text-slate-500">Employees</th>
                <th className="p-3 font-medium text-slate-500">Status</th>
                <th className="p-3 font-medium text-slate-500">Infolks Contact</th>
                <th className="p-3 font-medium text-slate-500">Referred By</th>
                <th className="p-3 font-medium text-slate-500">Est. Amount</th>
                <th className="p-3 font-medium text-slate-500">Visit Date</th>
                <th className="p-3 font-medium text-slate-500">Remarks</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="p-3 text-slate-700 font-medium">{e.company_name}</td>
                  <td className="p-3 text-slate-500">{e.process || '-'}</td>
                  <td className="p-3 text-slate-500">{e.industry_type || '-'}</td>
                  <td className="p-3 text-slate-500">{e.location || '-'}</td>
                  <td className="p-3 text-slate-500">{e.state || '-'}</td>
                  <td className="p-3 text-slate-500">{e.contact_number || '-'}</td>
                  <td className="p-3 text-slate-500">{e.contact_person_name || '-'}</td>
                  <td className="p-3 text-slate-500">{e.contact_person_designation || '-'}</td>
                  <td className="p-3 text-slate-500">{e.number_of_employees || '-'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      e.participation_status === 'Interested' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {e.participation_status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">{e.infolks_contact_person || '-'}</td>
                  <td className="p-3 text-slate-500">{e.referred_by || '-'}</td>
                  <td className="p-3 text-slate-500">{e.estimated_amount || '-'}</td>
                  <td className="p-3 text-slate-500">{e.field_visited_date || '-'}</td>
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
                <tr><td colSpan="16" className="p-4 text-center text-slate-400">No entries yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export default ContributorDatabase;