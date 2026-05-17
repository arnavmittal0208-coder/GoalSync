import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, LockKeyhole, Mail, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMOS = [
  { role: 'employee', email: 'employee@goalsync.com', password: 'employee123', label: 'Employee' },
  { role: 'manager', email: 'manager@goalsync.com', password: 'manager123', label: 'Manager' },
  { role: 'admin', email: 'admin@goalsync.com', password: 'admin123', label: 'Admin / HR' },
];

const REDIRECTS = { employee: '/employee/dashboard', manager: '/manager/dashboard', admin: '/admin/dashboard' };

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && user) {
    return <Navigate to={REDIRECTS[user.role] || '/employee/dashboard'} replace />;
  }

  const doLogin = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    if (!normalizedEmail || !trimmedPassword) {
      toast.error('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const currentUser = await login(normalizedEmail, trimmedPassword);
      navigate(REDIRECTS[currentUser.role] || '/employee/dashboard');
    } catch (err) {
      if (!err.response) {
        toast.error('Cannot reach server. Start the backend on port 5000, then try again.');
      } else if (err.response.status === 429) {
        toast.error('Too many attempts. Wait a minute and try again.');
      } else if (err.response.status === 401) {
        toast.error(
          err.response.data?.message ||
            'Invalid email or password. Use a demo account below or run npm run seed in goalsync-backend.'
        );
      } else {
        toast.error(err.response.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doLogin(form.email, form.password);
  };

  return (
    <div className="auth-page" id="top">
      <main className="auth-login">
        <div className="auth-login__wrap">
          <aside className="auth-login__left">
            <div className="auth-login__brand">
              <span className="auth-brand__icon auth-brand__icon--light">
                <Target size={18} />
              </span>
              <span className="auth-brand__text auth-brand__text--light">GoalSync</span>
            </div>

            <div>
              <h2 className="auth-login__headline">
                Your team's goals, <em>always</em> in focus.
              </h2>
              <p className="auth-login__copy">
                Sign in to access your workspace and keep your team aligned on what matters most this quarter.
              </p>
            </div>

            <div className="auth-login__footer">© 2026 GoalSync, Inc.</div>
          </aside>

          <div className="auth-login__right">
            <div className="auth-login__eyebrow">
              <LockKeyhole size={14} />
              Secure sign in
            </div>

            <h2 className="auth-login__title">Welcome back</h2>
            <p className="auth-login__subtitle">Use your corporate credentials to continue.</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <label className="auth-field">
                <span className="auth-field__label">
                  <Mail size={12} />
                  Corporate email
                </span>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </label>

              <label className="auth-field">
                <span className="auth-field__label">
                  <LockKeyhole size={12} />
                  Password
                </span>
                <input
                  className="auth-input"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
              </label>

              <a href="#top" className="auth-forgot">
                Forgot password?
              </a>

              <button type="submit" className="auth-submit" disabled={loading}>
                <span>{loading ? 'Signing in…' : 'Sign in'}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="auth-demo">
              <div className="auth-demo__title">Demo accounts — try without setup</div>
              <div className="auth-demo__list">
                {DEMOS.map(({ email, password, label }) => (
                  <button
                    key={email}
                    type="button"
                    className="auth-demo__item"
                    onClick={() => doLogin(email, password)}
                    disabled={loading}
                  >
                    <span className="auth-demo__role">{label}</span>
                    <span className="auth-demo__email">{email}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
