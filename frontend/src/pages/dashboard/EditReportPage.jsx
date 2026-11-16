import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../hooks/useAuth'
import { getItem, updateItem } from '../../services/itemService'
import { listCategories } from '../../services/referenceService'
import { todayAsDateInput } from '../../utils/formatDate'
import { LIMITS, validateItemDetails } from '../../utils/validateReport'

// Fix a typo or add detail to your own report.
// Lost/found, the community, photos and the private question stay as they are.
function EditForm({ item, categories }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: item.title,
    category_id: item.category_id,
    description: item.description,
    event_date: item.event_date,
    location_label: item.location_label,
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const backTo = item.report_type === 'LOST' ? '/dashboard/lost-reports' : '/dashboard/found-reports'

  function updateField(name, value) {
    setForm((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => ({ ...previous, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    const foundErrors = validateItemDetails(form)
    setErrors(foundErrors)
    if (Object.keys(foundErrors).length > 0) {
      return
    }

    setIsSaving(true)
    try {
      await updateItem(item.item_id, form)
      navigate(`/items/${item.item_id}`)
    } catch (saveError) {
      setSubmitError(saveError.message)
      setIsSaving(false)
    }
  }

  function errorProps(name) {
    return errors[name] ? { 'aria-invalid': true, 'aria-describedby': `${name}-error` } : {}
  }

  function fieldError(name) {
    return (
      errors[name] && (
        <span className="field-error" id={`${name}-error`}>
          {errors[name]}
        </span>
      )
    )
  }

  return (
    <form className="card edit-form" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <div className="alert alert-error" role="alert">
          {submitError}
        </div>
      )}

      <div className="field">
        <label className="field-label" htmlFor="title">
          What is it?
        </label>
        <input
          id="title"
          className="input"
          maxLength={LIMITS.title}
          value={form.title}
          onChange={(event) => updateField('title', event.target.value)}
          {...errorProps('title')}
        />
        {fieldError('title')}
      </div>

      <div className="field">
        <label className="field-label" htmlFor="category_id">
          Category
        </label>
        <select
          id="category_id"
          className="input"
          value={form.category_id}
          onChange={(event) => updateField('category_id', event.target.value)}
          {...errorProps('category_id')}
        >
          {categories.map((category) => (
            <option key={category.category_id} value={category.category_id}>
              {category.category_name}
            </option>
          ))}
        </select>
        {fieldError('category_id')}
      </div>

      <div className="field">
        <label className="field-label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          className="input"
          maxLength={LIMITS.description}
          value={form.description}
          onChange={(event) => updateField('description', event.target.value)}
          {...errorProps('description')}
        />
        {fieldError('description')}
      </div>

      <div className="edit-form-row">
        <div className="field">
          <label className="field-label" htmlFor="event_date">
            {item.report_type === 'LOST' ? 'Date lost' : 'Date found'}
          </label>
          <input
            id="event_date"
            className="input"
            type="date"
            max={todayAsDateInput()}
            value={form.event_date}
            onChange={(event) => updateField('event_date', event.target.value)}
            {...errorProps('event_date')}
          />
          {fieldError('event_date')}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="location_label">
            Where
          </label>
          <input
            id="location_label"
            className="input"
            maxLength={LIMITS.location}
            value={form.location_label}
            onChange={(event) => updateField('location_label', event.target.value)}
            {...errorProps('location_label')}
          />
          {fieldError('location_label')}
        </div>
      </div>

      <div className="edit-form-actions">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save changes'}
        </Button>
        <Button to={backTo} variant="ghost">
          Cancel
        </Button>
      </div>
    </form>
  )
}

function EditReportPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data, error, isLoading } = useAsync(() => Promise.all([getItem(id), listCategories()]), [id])

  if (isLoading && !data) {
    return <p className="loading-text">Loading…</p>
  }

  const [item, categories] = data || []
  const canEdit = item && item.reporter_id === user.user_id && ['OPEN', 'CLAIM_PENDING'].includes(item.status)

  if (error || !canEdit) {
    return (
      <EmptyState title="You can't edit this report" text="Only your own reports that are still open can be changed.">
        <Button to="/dashboard">Back to dashboard</Button>
      </EmptyState>
    )
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>Edit report</h1>
          <p>
            Change the details people see.
            {item.report_type === 'FOUND' && " The private question can't be changed, so claims stay fair."}
          </p>
        </div>
      </header>
      <EditForm item={item} categories={categories} />
    </>
  )
}

export default EditReportPage
