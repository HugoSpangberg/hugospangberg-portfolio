import { useEffect, useState } from 'react';
import { AdminApiError, isAdminEnabled } from './api/adminHttpClient';
import { getAdminSession } from './api/authAdminClient';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminExperienceFormPage from './pages/AdminExperienceFormPage';
import AdminExperiencesPage from './pages/AdminExperiencesPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminProjectFormPage from './pages/AdminProjectFormPage';
import AdminProjectsPage from './pages/AdminProjectsPage';

function path() {
  return window.location.pathname.replace(/\/$/, '') || '/';
}

function redirect(to: string) {
  window.history.replaceState({}, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function AdminApp() {
  const [currentPath, setCurrentPath] = useState(path);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const listener = () => setCurrentPath(path());
    window.addEventListener('popstate', listener);
    return () => window.removeEventListener('popstate', listener);
  }, []);

  useEffect(() => {
    if (!isAdminEnabled()) {
      setCheckingSession(false);
      return;
    }

    getAdminSession()
      .then((session) => setAuthenticated(session.authenticated))
      .catch((error) => {
        if (error instanceof AdminApiError && error.status === 401) {
          setAuthenticated(false);
        }
      })
      .finally(() => setCheckingSession(false));
  }, []);

  if (!isAdminEnabled()) {
    return (
      <main className="admin-login">
        <div className="admin-panel">
          <h1>Admin unavailable</h1>
          <p className="admin-muted">Admin requires VITE_ADMIN_ENABLED=true and VITE_API_BASE_URL.</p>
        </div>
      </main>
    );
  }

  if (checkingSession) {
    return <main className="admin-login"><p className="admin-muted">Checking session...</p></main>;
  }

  if (currentPath === '/admin/login') {
    return <AdminLoginPage />;
  }

  if (!authenticated) {
    redirect('/admin/login');
    return <AdminLoginPage />;
  }

  if (currentPath === '/admin') {
    return <AdminDashboardPage />;
  }

  if (currentPath === '/admin/experiences') {
    return <AdminExperiencesPage />;
  }

  if (currentPath === '/admin/experiences/new') {
    return <AdminExperienceFormPage />;
  }

  if (currentPath.startsWith('/admin/experiences/')) {
    return <AdminExperienceFormPage id={currentPath.split('/').at(-1)} />;
  }

  if (currentPath === '/admin/projects') {
    return <AdminProjectsPage />;
  }

  if (currentPath === '/admin/projects/new') {
    return <AdminProjectFormPage />;
  }

  if (currentPath.startsWith('/admin/projects/')) {
    return <AdminProjectFormPage id={currentPath.split('/').at(-1)} />;
  }

  return <AdminDashboardPage />;
}

export default AdminApp;
