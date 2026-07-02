import type { ReactNode } from 'react';
import { logoutAdmin } from '../api/authAdminClient';
import { navigate } from '../utils/adminNavigation';

type AdminShellProps = {
  children: ReactNode;
};

function AdminShell({ children }: AdminShellProps) {
  async function handleLogout() {
    await logoutAdmin();
    navigate('/admin/login');
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/admin" onClick={(event) => {
          event.preventDefault();
          navigate('/admin');
        }}>
          HS Admin
        </a>
        <nav className="admin-nav" aria-label="Admin sections">
          <a href="/admin/experiences" onClick={(event) => {
            event.preventDefault();
            navigate('/admin/experiences');
          }}>
            Experiences
          </a>
          <a href="/admin/projects" onClick={(event) => {
            event.preventDefault();
            navigate('/admin/projects');
          }}>
            Projects
          </a>
          <span>Education</span>
          <span>Skills</span>
        </nav>
        <button className="admin-button admin-button--ghost" type="button" onClick={handleLogout}>
          Sign out
        </button>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}

export default AdminShell;
