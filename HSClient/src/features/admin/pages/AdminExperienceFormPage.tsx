import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AdminApiError } from '../api/adminHttpClient';
import {
  createAdminExperience,
  deleteAdminExperience,
  getAdminExperience,
  publishAdminExperience,
  unpublishAdminExperience,
  updateAdminExperience,
} from '../api/experiencesAdminClient';
import AdminShell from '../components/AdminShell';
import type { UpsertAdminExperience } from '../models/adminModels';
import { navigate } from '../utils/adminNavigation';
import { FieldErrors, splitTags, validateExperience } from '../validation/adminValidation';

const emptyExperience: UpsertAdminExperience = {
  slug: '',
  locale: 'sv',
  company: '',
  role: '',
  location: '',
  employmentType: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  summary: '',
  description: '',
  technologies: [],
  highlights: [],
  sortOrder: 0,
  isPublished: false,
  version: undefined,
};

type Props = {
  id?: string;
};

function AdminExperienceFormPage({ id }: Props) {
  const isNew = !id;
  const [values, setValues] = useState<UpsertAdminExperience>(emptyExperience);
  const [savedSnapshot, setSavedSnapshot] = useState(JSON.stringify(emptyExperience));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const dirty = useMemo(() => JSON.stringify(values) !== savedSnapshot, [savedSnapshot, values]);

  useEffect(() => {
    if (!id) {
      return undefined;
    }

    const controller = new AbortController();
    getAdminExperience(id, controller.signal).then((item) => {
      const next = {
        slug: item.slug,
        locale: item.locale,
        company: item.company,
        role: item.role,
        location: item.location ?? '',
        employmentType: item.employmentType ?? '',
        startDate: item.startDate ?? '',
        endDate: item.endDate ?? '',
        isCurrent: item.isCurrent,
        summary: item.summary,
        description: item.description,
        technologies: item.technologies,
        highlights: item.highlights,
        sortOrder: item.sortOrder,
        isPublished: item.isPublished,
        version: item.version,
      };
      setValues(next);
      setSavedSnapshot(JSON.stringify(next));
    }).catch(() => setMessage('Could not load experience.'));

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
    const validationErrors = validateExperience(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const saved = isNew
        ? await createAdminExperience(values)
        : await updateAdminExperience(id, values);
      const next = {
        ...values,
        version: saved.version,
        isPublished: saved.isPublished,
      };
      setValues(next);
      setSavedSnapshot(JSON.stringify(next));
      setMessage('Saved.');

      if (isNew) {
        navigate(`/admin/experiences/${saved.id}`);
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
      const saved = values.isPublished
        ? await unpublishAdminExperience(id)
        : await publishAdminExperience(id);
      setValues((current) => ({ ...current, isPublished: saved.isPublished, version: saved.version }));
      setSavedSnapshot(JSON.stringify({ ...values, isPublished: saved.isPublished, version: saved.version }));
      setMessage(saved.isPublished ? 'Published.' : 'Unpublished.');
    } catch (error) {
      handleError(error);
    } finally {
      setSubmitting(false);
    }
  }

  async function remove() {
    if (!id || !window.confirm(`Delete ${values.company || 'this experience'}?`)) {
      return;
    }

    await deleteAdminExperience(id);
    navigate('/admin/experiences');
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

  function update<K extends keyof UpsertAdminExperience>(key: K, value: UpsertAdminExperience[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <AdminShell>
      <div className="admin-page-header">
        <div>
          <p className="admin-kicker">Experience</p>
          <h1>{isNew ? 'New experience' : values.company || 'Edit experience'}</h1>
        </div>
      </div>
      {message && <p className="admin-alert">{message}</p>}
      <form className="admin-form" onSubmit={save}>
        <Field label="Company" error={errors.company}>
          <input value={values.company} onChange={(event) => update('company', event.target.value)} />
        </Field>
        <Field label="Role" error={errors.role}>
          <input value={values.role} onChange={(event) => update('role', event.target.value)} />
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
        <Field label="Location">
          <input value={values.location ?? ''} onChange={(event) => update('location', event.target.value)} />
        </Field>
        <Field label="Employment type">
          <input value={values.employmentType ?? ''} onChange={(event) => update('employmentType', event.target.value)} />
        </Field>
        <Field label="Start date" error={errors.startDate}>
          <input type="date" value={values.startDate ?? ''} onChange={(event) => update('startDate', event.target.value)} />
        </Field>
        <Field label="End date" error={errors.endDate}>
          <input type="date" value={values.endDate ?? ''} disabled={values.isCurrent} onChange={(event) => update('endDate', event.target.value)} />
        </Field>
        <label className="admin-check">
          <input type="checkbox" checked={values.isCurrent} onChange={(event) => update('isCurrent', event.target.checked)} />
          Current position
        </label>
        <Field label="Summary" error={errors.summary}>
          <textarea value={values.summary} onChange={(event) => update('summary', event.target.value)} />
        </Field>
        <Field label="Description" error={errors.description}>
          <textarea rows={6} value={values.description} onChange={(event) => update('description', event.target.value)} />
        </Field>
        <Field label="Technologies">
          <input value={values.technologies.join(', ')} onChange={(event) => update('technologies', splitTags(event.target.value))} />
        </Field>
        <Field label="Highlights">
          <textarea value={values.highlights.join('\n')} onChange={(event) => update('highlights', event.target.value.split('\n').filter(Boolean))} />
        </Field>
        <Field label="Sort order" error={errors.sortOrder}>
          <input type="number" min="0" value={values.sortOrder} onChange={(event) => update('sortOrder', Number(event.target.value))} />
        </Field>
        <div className="admin-form-actions">
          <button className="admin-button" type="submit" disabled={submitting}>Save draft</button>
          <button className="admin-button admin-button--ghost" type="button" disabled={submitting} onClick={togglePublish}>
            {values.isPublished ? 'Unpublish' : 'Publish'}
          </button>
          <button className="admin-button admin-button--ghost" type="button" onClick={() => navigate('/admin/experiences')}>Cancel</button>
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

export default AdminExperienceFormPage;
