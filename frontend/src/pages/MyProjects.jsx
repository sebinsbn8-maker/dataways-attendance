import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMyProjects = async () => {
    setError('');
    try {
      const res = await api.get('/projects/my');
      setProjects(res.data);
    } catch (err) {
      setError('Failed to load your projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProjects();
  }, []);

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

  return (
    <Layout>
      <div className="p-4 sm:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">My Projects</h1>
          <p className="text-sm sm:text-base text-slate-500">Projects assigned to you</p>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {!loading && projects.length === 0 && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-slate-400">
            You haven't been assigned to any projects yet.
          </div>
        )}

        <div className="space-y-5">
          {projects.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#0a0a2e] to-indigo-900 px-4 sm:px-6 py-4 flex justify-between items-center">
                <h2 className="text-base sm:text-lg font-semibold text-white">{p.name}</h2>
                <span className="text-sm font-bold text-white bg-white/10 px-3 py-1 rounded-full">
                  {p.hours_worked} hrs worked
                </span>
              </div>

              <div className="p-4 sm:p-6 space-y-3">
                <div>{statusBadge(p.status)}</div>

                {p.description && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Description</p>
                    <p className="text-sm text-slate-700">{p.description}</p>
                  </div>
                )}

                {p.instructions && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-slate-500 mb-1">Instructions</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{p.instructions}</p>
                  </div>
                )}

                {p.link && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Reference Link</p>
                    <a href={p.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline break-all">
                      Open link: {p.link}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default MyProjects;