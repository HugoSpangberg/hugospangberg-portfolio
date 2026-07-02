import { FormEvent, useState } from 'react';
import { AdminApiError } from '../api/adminHttpClient';
import { loginAdmin } from '../api/authAdminClient';

function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await loginAdmin(username, password);
      window.location.assign('/admin');
    } catch (loginError) {
      setError(loginError instanceof AdminApiError && loginError.status === 401
        ? 'Invalid username or password.'
        : 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-login">
      <form className="admin-panel admin-login__form" onSubmit={handleSubmit}>
        <h1>Admin login</h1>
        {error && <p className="admin-alert admin-alert--error">{error}</p>}
        <label>
          <span>Username</span>
          <input
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>
        <label>
          <span>Password</span>
          <input
            autoComplete="current-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button className="admin-button" type="submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}

export default AdminLoginPage;
