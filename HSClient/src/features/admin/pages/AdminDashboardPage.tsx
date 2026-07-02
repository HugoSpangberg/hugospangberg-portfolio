import AdminShell from '../components/AdminShell';
import { navigate } from '../utils/adminNavigation';

function AdminDashboardPage() {
  return (
    <AdminShell>
      <div className="admin-page-header">
        <div>
          <p className="admin-kicker">Portfolio content</p>
          <h1>Content dashboard</h1>
        </div>
      </div>
      <div className="admin-grid">
        <button className="admin-section-tile" type="button" onClick={() => navigate('/admin/experiences')}>
          <span>Experiences</span>
          <strong>Create, edit, publish and reorder jobs.</strong>
        </button>
        <button className="admin-section-tile" type="button" onClick={() => navigate('/admin/projects')}>
          <span>Projects</span>
          <strong>Create, edit, publish and reorder projects.</strong>
        </button>
        <div className="admin-section-tile admin-section-tile--disabled">
          <span>Education</span>
          <strong>Typed CRUD foundation is ready; section not implemented yet.</strong>
        </div>
        <div className="admin-section-tile admin-section-tile--disabled">
          <span>Skills</span>
          <strong>Typed CRUD foundation is ready; section not implemented yet.</strong>
        </div>
      </div>
    </AdminShell>
  );
}

export default AdminDashboardPage;
