import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'Active', instructions: '', link: '' });

  const [selectedProject, setSelectedProject] = useState(null);
  const [assignEmployeeId, setAssignEmployeeId] = useState('');
  const [overview, setOverview] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ description: '', status: 'Active', instructions: '', link: '' });

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects/');
      setProjects(res.data);
    } catch (err) {
      setError('Failed to load projects');
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees/');
      setEmployees(res.data);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/projects/', formData);
      setFormData({ name: '', description: '', status: 'Active', instructions: '', link: '' });
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    try {
      await api.delete(`/projects/${id}`);
      if (selectedProject?.id === id) {
        setSelectedProject(null);
        setOverview(null);
      }
      fetchProjects();
    } catch (err) {
      setError('Failed to delete project');
    }
  };

  const openProject = async (project) => {
    setError('');
    setEditMode(false);
    try {
      const detailRes = await api.get(`/projects/${project.id}`);
      setSelectedProject(detailRes.data);
      setEditData({
        description: detailRes.data.description || '',
        status: detailRes.data.status,
        instructions: detailRes.data.instructions || '',
        link: detailRes.data.link || '',
      });
      const overviewRes = await api.get(`/projects/${project.id}/overview`);
      setOverview(overviewRes.data);
    } catch (err) {
      setError('Failed to load project details');
    }
  };

  const refreshSelected = async () => {
    if (!selectedProject) return;
    const detailRes = await api.get(`/projects/${selectedProject.id}`);
    setSelectedProject(detailRes.data);
    setEditData({
      description: detailRes.data.description || '',
      status: detailRes.data.status,
      instructions: detailRes.data.instructions || '',
      link: detailRes.data.link || '',
    });
    const overviewRes = await api.get(`/projects/${selectedProject.id}/overview`);
    setOverview(overviewRes.data);
    fetchProjects();
  };

  const handleAssign = async () => {
    if (!assignEmployeeId || !selectedProject) return;
    setError('');
    try {
      await api.post(`/projects/${selectedProject.id}/assign`, { employee_id: parseInt(assignEmployeeId) });
      setAssignEmployeeId('');
      refreshSelected();
    } catch (err) {
      setError('Failed to assign employee');
    }
  };

  const handleUnassign = async (employeeId) => {
    if (!selectedProject) return;
    try {
      await api.delete(`/projects/${selectedProject.id}/unassign/${employeeId}`);
      refreshSelected();
    } catch (err) {
      setError('Failed to unassign employee');
    }
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async () => {
    if (!selectedProject) return;
    setError('');
    try {
      await api.put(`/projects/${selectedProject.id}`, editData);
      setEditMode(false);
      refreshSelected();
    } catch (err) {
      setError('Failed to update project');
    }
  };

  const statusBadge = (status) => {
    const styles = {
      Active: 'bg-green-100 text-green-700',
      Completed: 'bg-slate-100 text-slate-600',
      'On Hold': 'bg-amber-100 text-amber-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || ''}`}>
        {status}
      </span>
    );
  };

  const unassignedEmployees = employees.filter(
    (emp) => !selectedProject?.employees?.some((pe) => pe.id === emp.id)
  );

  return (
    <Layout>
      <div className="p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">Projects</h1>
            <p className="text-sm sm:text-base text-slate-500">Create projects, assign employees, track hours</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 w-full sm:w-auto"
          >
            {showForm ? 'Cancel' : '+ New Project'}
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Project name" required className="border border-gray-200 rounded-lg px-3 py-2 w-full" />
            <select name="status" value={formData.status} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 w-full">
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
            <input name="description" value={formData.description} onChange={handleChange} placeholder="Description (optional)" className="sm:col-span-2 border border-gray-200 rounded-lg px-3 py-2 w-full" />
            <textarea name="instructions" value={formData.instructions} onChange={handleChange} placeholder="Instructions for assigned employees (optional)" rows={3} className="sm:col-span-2 border border-gray-200 rounded-lg px-3 py-2 w-full" />
            <input name="link" value={formData.link} onChange={handleChange} placeholder="Reference link (optional) — e.g. https://..." className="sm:col-span-2 border border-gray-200 rounded-lg px-3 py-2 w-full" />
            <button type="submit" className="sm:col-span-2 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700">
              Create Project
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project list */}
          <div className="lg:col-span-1 space-y-3">
            {projects.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-slate-400 text-sm">
                No projects yet
              </div>
            )}
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => openProject(p)}
                className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition ${
                  selectedProject?.id === p.id ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-gray-100 hover:border-indigo-200'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium text-slate-800">{p.name}</p>
                  {statusBadge(p.status)}
                </div>
                {p.description && <p className="text-xs text-slate-500">{p.description}</p>}
              </div>
            ))}
          </div>

          {/* Project detail / overview */}
          <div className="lg:col-span-2">
            {!selectedProject ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-slate-400">
                Select a project to view details and overview
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">{selectedProject.name}</h2>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setEditMode(!editMode)}
                        className="text-indigo-600 hover:underline text-xs font-medium"
                      >
                        {editMode ? 'Cancel Edit' : 'Edit Details'}
                      </button>
                      <button
                        onClick={() => handleDelete(selectedProject.id)}
                        className="text-red-600 hover:underline text-xs font-medium"
                      >
                        Delete Project
                      </button>
                    </div>
                  </div>

                  {editMode ? (
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                        <select name="status" value={editData.status} onChange={handleEditChange} className="border border-gray-200 rounded-lg px-3 py-2 w-full text-sm">
                          <option value="Active">Active</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                        <input name="description" value={editData.description} onChange={handleEditChange} className="border border-gray-200 rounded-lg px-3 py-2 w-full text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Instructions</label>
                        <textarea name="instructions" value={editData.instructions} onChange={handleEditChange} rows={4} className="border border-gray-200 rounded-lg px-3 py-2 w-full text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Reference Link</label>
                        <input name="link" value={editData.link} onChange={handleEditChange} placeholder="https://..." className="border border-gray-200 rounded-lg px-3 py-2 w-full text-sm" />
                      </div>
                      <button
                        onClick={handleSaveEdit}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  ) : (
                    <div className="mb-4 space-y-2">
                      {statusBadge(selectedProject.status)}
                      {selectedProject.description && (
                        <p className="text-sm text-slate-600">{selectedProject.description}</p>
                      )}
                      {selectedProject.instructions && (
                        <div className="bg-gray-50 rounded-lg p-3 mt-2">
                          <p className="text-xs font-medium text-slate-500 mb-1">Instructions</p>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedProject.instructions}</p>
                        </div>
                      )}
                      {selectedProject.link && (
                        <a href={selectedProject.link} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-indigo-600 hover:underline mt-1">
                          🔗 {selectedProject.link}
                        </a>
                      )}
                    </div>
                  )}

                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Assigned Employees</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedProject.employees.length === 0 && (
                      <p className="text-sm text-slate-400">No employees assigned yet</p>
                    )}
                    {selectedProject.employees.map((emp) => (
                      <span key={emp.id} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm">
                        {emp.name}
                        <button onClick={() => handleUnassign(emp.id)} className="text-indigo-400 hover:text-indigo-700">
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={assignEmployeeId}
                      onChange={(e) => setAssignEmployeeId(e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1"
                    >
                      <option value="">Select employee to assign...</option>
                      {unassignedEmployees.map((emp) => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssign}
                      disabled={!assignEmployeeId}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Assign
                    </button>
                  </div>
                </div>

                {overview && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#0a0a2e] to-indigo-900 px-4 sm:px-6 py-4 flex justify-between items-center">
                      <h3 className="text-base font-semibold text-white">Hours Overview</h3>
                      <span className="text-base font-bold text-white bg-white/10 px-3 py-1 rounded-full">
                        {overview.total_hours} hrs total
                      </span>
                    </div>
                    <div className="p-4 sm:p-6">
                      {overview.by_employee.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">No hours logged yet</p>
                      ) : (
                        <div className="space-y-3">
                          {overview.by_employee.map((e) => {
                            const pct = overview.total_hours > 0 ? (e.hours / overview.total_hours) * 100 : 0;
                            return (
                              <div key={e.employee_id}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-slate-700 font-medium">{e.employee_name}</span>
                                  <span className="text-slate-500">{e.hours} hrs</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                  <div
                                    className="bg-indigo-500 h-2 rounded-full transition-all"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Projects;