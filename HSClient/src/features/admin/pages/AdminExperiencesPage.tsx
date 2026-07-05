import { useEffect, useMemo, useState } from 'react';
import {
  deleteAdminExperience,
  getAdminExperiences,
  publishAdminExperience,
  reorderAdminExperiences,
  unpublishAdminExperience,
} from '../api/experiencesAdminClient';
import AdminShell from '../components/AdminShell';
import type { AdminExperience, Locale } from '../models/adminModels';
import { navigate } from '../utils/adminNavigation';

type StatusFilter = 'all' | 'published' | 'draft';

function AdminExperiencesPage() {
  const [items, setItems] = useState<AdminExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [locale, setLocale] = useState<'all' | Locale>('all');
  const [status, setStatus] = useState<StatusFilter>('all');

  useEffect(() => {
    const controller = new AbortController();
    getAdminExperiences(controller.signal)
      .then((response) => setItems(response.items))
      .catch(() => setError('Could not load experiences.'))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const filteredItems = useMemo(() => items.filter((item) => {
    const text = `${item.company} ${item.role} ${item.slug}`.toLowerCase();
    return text.includes(query.toLowerCase()) &&
      (locale === 'all' || item.locale === locale) &&
      (status === 'all' ||
        (status === 'published' && item.isPublished) ||
        (status === 'draft' && !item.isPublished));
  }), [items, locale, query, status]);

  async function refresh() {
    const response = await getAdminExperiences();
    setItems(response.items);
  }

  async function togglePublish(item: AdminExperience) {
    await (item.isPublished
      ? unpublishAdminExperience(item.id)
      : publishAdminExperience(item.id));
    await refresh();
  }

  async function deleteItem(item: AdminExperience) {
    if (!window.confirm(`Delete ${item.company} - ${item.role}?`)) {
      return;
    }

    await deleteAdminExperience(item.id);
    await refresh();
  }

  async function move(item: AdminExperience, direction: -1 | 1) {
    const sameLocale = items
      .filter((candidate) => candidate.locale === item.locale)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sameLocale.findIndex((candidate) => candidate.id === item.id);
    const swap = sameLocale[index + direction];

    if (!swap) {
      return;
    }

    await reorderAdminExperiences([
      { id: item.id, sortOrder: swap.sortOrder, version: item.version },
      { id: swap.id, sortOrder: item.sortOrder, version: swap.version },
    ]);
    await refresh();
  }

  return (
    <AdminShell>
      <div className="admin-page-header">
        <div>
          <p className="admin-kicker">Content</p>
          <h1>Experiences</h1>
        </div>
        <button className="admin-button" type="button" onClick={() => navigate('/admin/experiences/new')}>
          New experience
        </button>
      </div>
      <div className="admin-toolbar">
        <input placeholder="Search" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select value={locale} onChange={(event) => setLocale(event.target.value as 'all' | Locale)}>
          <option value="all">All locales</option>
          <option value="sv">Swedish</option>
          <option value="en">English</option>
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}>
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>
      {loading && <p className="admin-muted">Loading experiences...</p>}
      {error && <p className="admin-alert admin-alert--error">{error}</p>}
      {!loading && filteredItems.length === 0 && <p className="admin-muted">No experiences match the current filters.</p>}
      {filteredItems.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Locale</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td>{item.company}</td>
                <td>{item.role}</td>
                <td>{item.locale}</td>
                <td>{item.isPublished ? 'Published' : 'Draft'}</td>
                <td>{new Date(item.updatedAt).toLocaleString()}</td>
                <td>{item.sortOrder}</td>
                <td>
                  <div className="admin-row-actions">
                    <button type="button" onClick={() => move(item, -1)}>Up</button>
                    <button type="button" onClick={() => move(item, 1)}>Down</button>
                    <button type="button" onClick={() => navigate(`/admin/experiences/${item.id}`)}>Edit</button>
                    <button type="button" onClick={() => togglePublish(item)}>
                      {item.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button type="button" onClick={() => deleteItem(item)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminShell>
  );
}

export default AdminExperiencesPage;
