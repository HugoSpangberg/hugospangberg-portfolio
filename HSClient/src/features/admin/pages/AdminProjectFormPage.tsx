import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AdminApiError } from '../api/adminHttpClient';
import {
  createAdminProject,
  deleteAdminProject,
  getAdminProject,
  publishAdminProject,
  unpublishAdminProject,
  updateAdminProject,
} from '../api/projectsAdminClient';
import AdminShell from '../components/AdminShell';
import type { UpsertAdminProject } from '../models/adminModels';
import { navigate } from '../utils/adminNavigation';
import { FieldErrors, splitTags, validateProject } from '../validation/adminValidation';

const emptyProject: UpsertAdminProject = {
  slug: '',
  locale: 'sv',
  title: '',
  shortDescription: '',
  description: '',
  technologies: [],
  repositoryUrl: '',
  liveUrl: '',
  imageUrl: '',
  featured: false,
  sortOrder: 0,
  isPublished: false,
  version: undefined,
};

type Props = {
  id?: string;
};

function AdminProjectFormPage({ id }: Props) {
  const isNew = !id;
  const [values, setValues] = useState<UpsertAdminProject>(emptyProject);
  const [savedSnapshot, setSavedSnapshot] = useState(JSON.stringify(emptyProject));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const dirty = useMemo(() => JSON.stringify(values) !== savedSnapshot, [savedSnapshot, values]);

  useEffect(() => {
    if (!id) {
      return undefined;
    }

    const controller = new AbortController();
    getAdminProject(id, controller.signal).then((item) => {
      const next = {
        slug: item.slug,
        locale: item.locale,
        title: item.title,
        shortDescription: item.shortDescription,
        description: item.description,
        technologies: item.technologies,
        repositoryUrl: item.repositoryUrl ?? '',
        liveUrl: item.liveUrl ?? '',
        imageUrl: item.imageUrl ?? '',
        featured: item.featured,
        sortOrder: item.sortOrder,
        isPublished: item.isPublished,
        version: item.version,
      };
      setValues(next);
      setSavedSnapshot(JSON.stringify(next));
    }).catch(() => setMessage('Could not load project.'));

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  async function save(event?: FormEvent) {
    event?.preventDefault();
    const validationErrors = validateProject(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const saved = isNew ? await createAdminProject(values) : await updateAdminProject(id, values);
      const next = { ...values, version: saved.version, isPublished: saved.isPublished };
      setValues(next);
      setSavedSnapshot(JSON.stringify(next));
      setMessage('Saved.');

      if (isNew) {
        navigate(`/admin/projects/${saved.id}`);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePublish() {
    if (!id) {
      await save();
      return;
    }

    setSubmitting(true);
    try {
      const saved = values.isPublished ? await unpublishAdminProject(id) : await publishAdminProject(id);
      const next = { ...values, isPublished: saved.isPublished, version: saved.version };
      setValues(next);
      setSavedSnapshot(JSON.stringify(next));
      setMessage(saved.isPublished ? 'Published.' : 'Unpublished.');
    } catch (error) {
      handleError(error);
    } finally {
      setSubmitting(false);
    }
  }

  async function remove() {
    if (!id || !window.confirm(`Delete ${values.title || 'this project'}?`)) {
      return;
    }

    await deleteAdminProject(id);
    navigate('/admin/projects');
  }

  function handleError(error: unknown) {
    if (error instanceof AdminApiError) {
      if (error.status === 409) {
        setMessage('This item changed elsewhere. Reload it before saving again.');
        return;
      }

      if (error.problem?.errors) {
        setErrors(error.problem.errors);
        return;
      }
    }

    setMessage('Save failed.');
  }

  function update<K extends keyof UpsertAdminProject>(key: K, value: UpsertAdminProject[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <AdminShell>
      <div className="admin-page-header">
        <div>
          <p className="admin-kicker">Project</p>
          <h1>{isNew ? 'New project' : values.title || 'Edit project'}</h1>
        </div>
      </div>
      {message && <p className="admin-alert">{message}</p>}
      <form className="admin-form" onSubmit={save}>
        <Field label="Title" error={errors.title}>
          <input value={values.title} onChange={(event) => update('title', event.target.value)} />
        </Field>
        <Field label="Locale" error={errors.locale}>
          <select value={values.locale} onChange={(event) => update('locale', event.target.value as 'sv' | 'en')}>
            <option value="sv">Swedish</option>
            <option value="en">English</option>
          </select>
        </Field>
        <Field label="Slug" error={errors.slug}>
          <input value={values.slug} onChange={(event) => update('slug', event.target.value)} />
        </Field>
        <Field label="Short description" error={errors.shortDescription}>
          <textarea value={values.shortDescription} onChange={(event) => update('shortDescription', event.target.value)} />
        </Field>
        <Field label="Description" error={errors.description}>
          <textarea rows={6} value={values.description} onChange={(event) => update('description', event.target.value)} />
        </Field>
        <Field label="Technologies">
          <input value={values.technologies.join(', ')} onChange={(event) => update('technologies', splitTags(event.target.value))} />
        </Field>
        <Field label="Repository URL" error={errors.repositoryUrl}>
          <input value={values.repositoryUrl ?? ''} onChange={(event) => update('repositoryUrl', event.target.value)} />
        </Field>
        <Field label="Live URL" error={errors.liveUrl}>
          <input value={values.liveUrl ?? ''} onChange={(event) => update('liveUrl', event.target.value)} />
        </Field>
        <Field label="Image URL" error={errors.imageUrl}>
          <input value={values.imageUrl ?? ''} onChange={(event) => update('imageUrl', event.target.value)} />
        </Field>
        <label className="admin-check">
          <input type="checkbox" checked={values.featured} onChange={(event) => update('featured', event.target.checked)} />
          Featured
        </label>
        <Field label="Sort order" error={errors.sortOrder}>
          <input type="number" min="0" value={values.sortOrder} onChange={(event) => update('sortOrder', Number(event.target.value))} />
        </Field>
        <div className="admin-form-actions">
          <button className="admin-button" type="submit" disabled={submitting}>Save draft</button>
          <button className="admin-button admin-button--ghost" type="button" disabled={submitting} onClick={togglePublish}>
            {values.isPublished ? 'Unpublish' : 'Publish'}
          </button>
          <button className="admin-button admin-button--ghost" type="button" onClick={() => navigate('/admin/projects')}>Cancel</button>
          {!isNew && <button className="admin-button admin-button--danger" type="button" onClick={remove}>Delete</button>}
        </div>
      </form>
    </AdminShell>
  );
}

function Field({ label, error, children }: { label: string; error?: string[]; children: ReactNode }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      {children}
      {error?.map((item) => <small key={item}>{item}</small>)}
    </label>
  );
}

export default AdminProjectFormPage;
