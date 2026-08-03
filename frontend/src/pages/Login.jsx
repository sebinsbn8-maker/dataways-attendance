import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import logo from '../assets/logo.png';
import { GoogleLogin } from '@react-oauth/google';

function Login() {
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', department: '', shift: '' });
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

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

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');
    try {
      await api.post('/auth/register', signupData);
      setSignupSuccess(true);
    } catch (err) {
      setSignupError(err.response?.data?.detail || 'Failed to create account');
    }
  };

  const handleForgotClick = (e) => {
    e.preventDefault();
    alert('Please contact your Admin to reset your password.');
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post('/auth/google', { credential: credentialResponse.credential });
      localStorage.setItem('token', res.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError('Google sign-in failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[70%] bg-[#0a0a2e] text-white flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Dataways" className="h-10" />
          <span className="text-xl font-bold">Dataways</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Everything loops<br />back to one place.
          </h1>
          <p className="text-indigo-200 text-lg">
            Attendance, shifts, projects, and leads — your whole team's work in one workspace.
          </p>
        </div>
        <p className="text-indigo-300/60 text-sm">Secure team workspace · From Infolks Group</p>
      </div>

      <div className="w-full lg:w-[30%] flex flex-col items-center justify-center bg-[#0a0a2e] lg:bg-[#f5f6fb] min-h-screen lg:min-h-0">
        <div className="lg:hidden w-full pt-12 pb-8 flex items-center justify-center gap-2">
          <img src={logo} alt="Dataways" className="h-8" />
          <span className="text-lg font-bold text-white">Dataways</span>
        </div>

        <div className="w-full max-w-sm px-6 pb-10 lg:px-8 lg:pb-8 lg:bg-transparent pt-4 lg:pt-0 flex-1 lg:flex-none">
          <h2 className="text-2xl font-bold text-white lg:text-slate-900 mb-1">
            {activeTab === 'signin' ? 'Sign in' : 'Create account'}
          </h2>
          <p className="text-indigo-200 lg:text-slate-500 mb-6">
            {activeTab === 'signin' ? 'Welcome back to your workspace.' : 'Join your team workspace.'}
          </p>

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
            signupSuccess ? (
              <div className="bg-green-50 text-green-700 text-sm p-4 rounded-lg">
                Account created! You can now switch to Sign in and log in.
              </div>
            ) : (
              <form onSubmit={handleSignupSubmit}>
                {signupError && (
                  <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">
                    {signupError}
                  </div>
                )}

                <label className="block text-xs font-semibold tracking-wide text-slate-500 mb-1 uppercase">Full Name</label>
                <input
                  name="name"
                  type="text"
                  value={signupData.name}
                  onChange={handleSignupChange}
                  required
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <label className="block text-xs font-semibold tracking-wide text-slate-500 mb-1 uppercase">Email</label>
                <input
                  name="email"
                  type="email"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  required
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <label className="block text-xs font-semibold tracking-wide text-slate-500 mb-1 uppercase">Password</label>
                <input
                  name="password"
                  type="password"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  required
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <label className="block text-xs font-semibold tracking-wide text-slate-500 mb-1 uppercase">Department</label>
                <input
                  name="department"
                  type="text"
                  value={signupData.department}
                  onChange={handleSignupChange}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  Create account
                </button>
              </form>
            )
          ) : (
            <div>
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
                  <a href="#" onClick={handleForgotClick} className="text-xs text-indigo-600 hover:underline">
                    Forgot password?
                  </a>
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

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google sign-in failed')}
                  width="320"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;