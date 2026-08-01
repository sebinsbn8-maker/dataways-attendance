import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import logo from '../assets/logo.png';

function Login() {
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[70%] bg-[#0a0a2e] text-white flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Dataways" className="h-10" />
          <span className="text-xl font-bold">Dataways</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Where attendance<br />becomes insight.
          </h1>
          <p className="text-indigo-200 text-lg">
            Track check-ins, shifts, and leave across your team — all in one place.
          </p>
        </div>
        <p className="text-indigo-300/60 text-sm">Secure attendance platform · From Infolks Group</p>
      </div>

      {/* Right login form */}
      <div className="w-full lg:w-[30%] flex items-center justify-center bg-[#f5f6fb] p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 text-center flex items-center justify-center gap-2">
            <img src={logo} alt="Dataways" className="h-10" />
            <span className="text-xl font-bold text-slate-900">Dataways</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h2>
          <p className="text-slate-500 mb-6">Welcome back to your workspace.</p>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'create' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Create account
            </button>
          </div>

          {activeTab === 'create' ? (
            <div className="bg-indigo-50 text-indigo-700 text-sm p-4 rounded-lg">
              New accounts are created by your Admin. Please contact your HR or Admin team to get access.
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <label className="block text-xs font-semibold tracking-wide text-slate-500 mb-1 uppercase">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">Password</label>
                  <a href="#" className="text-xs text-indigo-600 hover:underline">Forgot password?</a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  Sign in
                </button>
              </form>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-slate-400">or continue with</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <button
                type="button"
                onClick={() => alert('Google sign-in is not set up yet.')}
                className="w-full bg-white border border-gray-200 text-slate-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.766 12.276c0-.818-.074-1.606-.212-2.364H12.24v4.474h6.484a5.55 5.55 0 01-2.41 3.643v3.03h3.9c2.28-2.1 3.552-5.19 3.552-8.783z"/>
                  <path fill="#34A853" d="M12.24 24c3.26 0 5.994-1.08 7.992-2.94l-3.9-3.03c-1.08.724-2.462 1.15-4.092 1.15-3.148 0-5.812-2.126-6.764-4.984h-4.02v3.13C3.44 21.3 7.51 24 12.24 24z"/>
                  <path fill="#FBBC05" d="M5.476 14.196A7.23 7.23 0 015.1 12c0-.762.132-1.5.376-2.196v-3.13h-4.02A11.98 11.98 0 000 12c0 1.936.464 3.768 1.276 5.326l4.2-3.13z"/>
                  <path fill="#EA4335" d="M12.24 4.77c1.774 0 3.366.61 4.62 1.804l3.464-3.464C18.228 1.19 15.494 0 12.24 0 7.51 0 3.44 2.7 1.276 6.674l4.2 3.13c.952-2.858 3.616-4.984 6.764-4.984z"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;