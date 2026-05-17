import { useEffect, useMemo, useState } from 'react'
import './index.css'

const stepOrder = ['setup', 'upload', 'details', 'creative', 'review']

const stepMeta = {
  setup: { label: 'Work Setup', eyebrow: 'Step 1' },
  upload: { label: 'Photo Upload', eyebrow: 'Step 2' },
  details: { label: 'Product Details', eyebrow: 'Step 3' },
  creative: { label: 'Creative Setup', eyebrow: 'Step 4' },
  review: { label: 'Review & Start', eyebrow: 'Step 5' },
}

const garmentOptions = ['Saree', 'Kurti', 'Lehenga', 'Blouse', 'Dupatta', 'Gown', 'Shirt', 'Kids Wear', 'Other']
const audienceOptions = ['Women', 'Men', 'Kids']
const workTypeOptions = [
  { value: 'image', label: 'Image Generation' },
  { value: 'video', label: 'Video Generation' },
  { value: 'image-video', label: 'Image + Video' },
]

const outputIntentOptions = ['Catalog', 'Creative Campaign', 'Marketplace Listing', 'Social Reel']
const poseOptions = ['Front Straight', 'Walking Three-Quarter', 'Side Detail Pose', 'Close-Up Detail', 'Seated Editorial']
const backgroundOptions = ['White Studio', 'Warm Beige Studio', 'Festive Set', 'Outdoor Neutral', 'Soft Gradient Backdrop']
const motionOptions = ['Slow Turn', 'Runway Walk', 'Fabric Flow Reveal', 'Detail Reveal']
const presetOptions = [
  { id: 'catalog', label: 'Catalog Clean', description: 'Simple ecommerce-ready output with clean framing.' },
  { id: 'premium', label: 'Premium Studio', description: 'Luxury fashion look with richer lighting and texture focus.' },
  { id: 'social', label: 'Social Creative', description: 'Sharper styling and stronger ad-friendly visual direction.' },
]

const initialJob = {
  jobName: '',
  workType: 'image-video',
  garmentType: 'Saree',
  audience: 'Women',
  outputIntent: 'Catalog',
  brandName: '',
}

const initialDetails = {
  title: '',
  fabric: '',
  palette: '',
  pattern: '',
  silhouette: '',
  neckline: '',
  sleeves: '',
  embellishment: '',
  notes: '',
}

const initialCreative = {
  presetId: 'catalog',
  modelDirection: '',
  pose: poseOptions[0],
  background: backgroundOptions[0],
  lighting: '',
  camera: '',
  styling: '',
  videoMotion: motionOptions[0],
}

function createId() {
  if (globalThis.crypto && globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID()
  return 'mir-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

function getHashScreen() {
  const hash = String(globalThis.location && globalThis.location.hash ? globalThis.location.hash : '')
    .replace(/^#/, '')
    .trim()

  if (hash === 'home') return 'home'
  if (stepOrder.includes(hash)) return hash
  return 'home'
}

function joinClasses() {
  return Array.from(arguments).filter(Boolean).join(' ')
}

function buildImagePrompt(job, details, creative, presetLabel, photoCount) {
  return [
    'Create a highly realistic ' + job.garmentType.toLowerCase() + ' image for ' + job.audience.toLowerCase() + ' wear.',
    'Work type: ' + job.workType + '. Output intent: ' + job.outputIntent + '.',
    'Use ' + photoCount + ' uploaded reference photo(s) and keep the product identity accurate.',
    'Fabric: ' + details.fabric + '. Palette: ' + details.palette + '. Pattern: ' + details.pattern + '.',
    'Silhouette: ' + details.silhouette + '. Neckline: ' + details.neckline + '. Sleeves: ' + details.sleeves + '.',
    'Embellishment: ' + details.embellishment + '. Model direction: ' + creative.modelDirection + '.',
    'Preset: ' + presetLabel + '. Pose: ' + creative.pose + '. Background: ' + creative.background + '.',
    'Lighting: ' + creative.lighting + '. Camera: ' + creative.camera + '. Styling: ' + creative.styling + '.',
    'Notes: ' + details.notes + '.',
  ].join(' ')
}

function buildVideoPrompt(job, details, creative, presetLabel) {
  return [
    'Create a short product video for a ' + job.garmentType.toLowerCase() + ' for ' + job.audience.toLowerCase() + ' wear.',
    'Output intent: ' + job.outputIntent + '. Preset: ' + presetLabel + '.',
    'Retain fabric and product truth: ' + details.fabric + ', ' + details.palette + ', ' + details.pattern + ', ' + details.embellishment + '.',
    'Base pose: ' + creative.pose + '. Motion: ' + creative.videoMotion + '. Background: ' + creative.background + '.',
    'Lighting: ' + creative.lighting + '. Camera: ' + creative.camera + '. Styling: ' + creative.styling + '.',
  ].join(' ')
}

function App() {
  const [screen, setScreen] = useState(getHashScreen())
  const [job, setJob] = useState(initialJob)
  const [details, setDetails] = useState(initialDetails)
  const [creative, setCreative] = useState(initialCreative)
  const [photos, setPhotos] = useState([])
  const [primaryPhotoId, setPrimaryPhotoId] = useState('')
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    const onHashChange = () => setScreen(getHashScreen())
    globalThis.addEventListener('hashchange', onHashChange)
    return () => globalThis.removeEventListener('hashchange', onHashChange)
  }, [])

  const preset = presetOptions.find((item) => item.id === creative.presetId) || presetOptions[0]

  const completion = useMemo(() => {
    const detailCount = Object.values(details).filter((value) => String(value || '').trim()).length
    return {
      setup: Boolean(job.jobName && job.garmentType && job.audience && job.workType),
      upload: photos.length > 0 && Boolean(primaryPhotoId),
      details: detailCount >= 6,
      creative: Boolean(creative.modelDirection && creative.lighting && creative.camera),
      review: jobs.length > 0,
    }
  }, [creative, details, job, jobs.length, photos.length, primaryPhotoId])

  const currentStepIndex = stepOrder.indexOf(screen)
  const nextStep = currentStepIndex >= 0 ? stepOrder[currentStepIndex + 1] || null : 'setup'
  const previousStep = currentStepIndex > 0 ? stepOrder[currentStepIndex - 1] : null

  const prompts = useMemo(() => {
    return {
      image: buildImagePrompt(job, details, creative, preset.label, photos.length),
      video: buildVideoPrompt(job, details, creative, preset.label),
    }
  }, [creative, details, job, photos.length, preset.label])

  const canMove = {
    setup: completion.setup,
    upload: completion.setup,
    details: completion.upload,
    creative: completion.details,
    review: completion.creative,
  }

  const goToScreen = (nextScreen) => {
    if (!nextScreen) return
    setScreen(nextScreen)
    globalThis.location.hash = nextScreen === 'home' ? 'home' : nextScreen
  }

  const startWork = () => {
    goToScreen('setup')
  }

  const onJobFieldChange = (field, value) => {
    setJob((prev) => ({ ...prev, [field]: value }))
  }

  const onDetailFieldChange = (field, value) => {
    setDetails((prev) => ({ ...prev, [field]: value }))
  }

  const onCreativeFieldChange = (field, value) => {
    setCreative((prev) => ({ ...prev, [field]: value }))
  }

  const onPhotoUpload = (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    const nextPhotos = files.map((file) => ({
      id: createId(),
      name: file.name,
      sizeLabel: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      previewUrl: URL.createObjectURL(file),
    }))

    setPhotos((prev) => {
      const merged = prev.concat(nextPhotos)
      if (!primaryPhotoId && merged[0]) setPrimaryPhotoId(merged[0].id)
      return merged
    })
  }

  const removePhoto = (photoId) => {
    setPhotos((prev) => {
      const next = prev.filter((photo) => photo.id !== photoId)
      if (primaryPhotoId === photoId) {
        setPrimaryPhotoId(next[0] ? next[0].id : '')
      }
      return next
    })
  }

  const startOutputJobs = () => {
    const nextJobs = []

    if (job.workType === 'image' || job.workType === 'image-video') {
      nextJobs.push({
        id: createId(),
        kind: 'Image',
        title: job.jobName || job.garmentType + ' image job',
        status: 'Pending',
        note: 'Ready from review page with preset ' + preset.label + '.',
      })
    }

    if (job.workType === 'video' || job.workType === 'image-video') {
      nextJobs.push({
        id: createId(),
        kind: 'Video',
        title: job.jobName || job.garmentType + ' video job',
        status: 'Pending',
        note: 'Ready from review page with motion ' + creative.videoMotion + '.',
      })
    }

    setJobs((prev) => nextJobs.concat(prev))
  }

  if (screen === 'home') {
    return (
      <div className="landing-shell">
        <section className="landing-card">
          <p className="eyebrow">Miraai Textile AI</p>
          <h1 className="landing-title">Office-ready step-by-step textile workflow</h1>
          <p className="landing-copy">
            Start work, choose garment type, upload multiple photos, fill product details, and only then move to prompt and output.
          </p>

          <div className="landing-steps">
            <article className="landing-step">
              <strong>1. Work Setup</strong>
              <span>Choose saree, kurti, women, men, kids, and output type.</span>
            </article>
            <article className="landing-step">
              <strong>2. Multi-Photo Upload</strong>
              <span>Add multiple references and pick the main photo.</span>
            </article>
            <article className="landing-step">
              <strong>3. Review & Start</strong>
              <span>Check all details before image or video job starts.</span>
            </article>
          </div>

          <button type="button" className="primary-button landing-start-button" onClick={startWork}>
            Start Work
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="wizard-shell">
      <header className="wizard-topbar">
        <div>
          <p className="eyebrow">Textile Workflow</p>
          <h1 className="wizard-title">{stepMeta[screen].label}</h1>
          <p className="wizard-copy">One step at a time. Finish this page, then move to the next.</p>
        </div>

        <div className="wizard-topbar-actions">
          <button type="button" className="secondary-button" onClick={() => goToScreen('home')}>
            Home
          </button>
          {previousStep ? (
            <button type="button" className="secondary-button" onClick={() => goToScreen(previousStep)}>
              Back
            </button>
          ) : null}
          {nextStep ? (
            <button
              type="button"
              className="primary-button"
              disabled={!canMove[nextStep]}
              onClick={() => goToScreen(nextStep)}
            >
              Next
            </button>
          ) : null}
        </div>
      </header>

      <section className="wizard-stepbar">
        {stepOrder.map((step, index) => (
          <button
            key={step}
            type="button"
            className={joinClasses('wizard-step', screen === step && 'active')}
            disabled={step !== 'setup' && !canMove[step]}
            onClick={() => goToScreen(step)}
          >
            <strong>{index + 1}. {stepMeta[step].label}</strong>
            <span>{completion[step] ? 'Done' : 'Open'}</span>
          </button>
        ))}
      </section>

      <main className="page-shell">
        {screen === 'setup' ? (
          <section className="page-card">
            <div className="page-head">
              <p className="eyebrow">{stepMeta.setup.eyebrow}</p>
              <h2>Set up the work</h2>
              <p>Choose what kind of office work this is before uploading anything.</p>
            </div>

            <div className="form-grid">
              <label className="field full">
                <span>Job Name</span>
                <input
                  value={job.jobName}
                  onChange={(event) => onJobFieldChange('jobName', event.target.value)}
                  placeholder="Example: Festival saree catalog set"
                />
              </label>

              <label className="field">
                <span>Work Type</span>
                <select value={job.workType} onChange={(event) => onJobFieldChange('workType', event.target.value)}>
                  {workTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>

              <label className="field">
                <span>Output Intent</span>
                <select value={job.outputIntent} onChange={(event) => onJobFieldChange('outputIntent', event.target.value)}>
                  {outputIntentOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>

              <label className="field">
                <span>Garment Type</span>
                <select value={job.garmentType} onChange={(event) => onJobFieldChange('garmentType', event.target.value)}>
                  {garmentOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>

              <label className="field">
                <span>Target Audience</span>
                <select value={job.audience} onChange={(event) => onJobFieldChange('audience', event.target.value)}>
                  {audienceOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>

              <label className="field full">
                <span>Brand / Client Name</span>
                <input
                  value={job.brandName}
                  onChange={(event) => onJobFieldChange('brandName', event.target.value)}
                  placeholder="Optional brand or client name"
                />
              </label>
            </div>

            <PageFooter
              helper="Once work setup is correct, move to multi-photo upload."
              primaryLabel="Continue to Photo Upload"
              primaryDisabled={!completion.setup}
              onPrimary={() => goToScreen('upload')}
            />
          </section>
        ) : null}

        {screen === 'upload' ? (
          <section className="page-card">
            <div className="page-head">
              <p className="eyebrow">{stepMeta.upload.eyebrow}</p>
              <h2>Upload reference photos</h2>
              <p>Add multiple cloth photos. Then choose one main photo that the system should treat as the primary reference.</p>
            </div>

            <label className="upload-box">
              <input type="file" accept="image/*" multiple onChange={onPhotoUpload} />
              <strong>Add multiple photos</strong>
              <span>Flat lay, close-up, border, embroidery, front, and back photos can all be added here.</span>
            </label>

            <div className="photo-grid">
              {photos.length ? photos.map((photo) => (
                <article key={photo.id} className={joinClasses('photo-card', primaryPhotoId === photo.id && 'photo-card-primary')}>
                  <img src={photo.previewUrl} alt={photo.name} />
                  <div className="photo-card-copy">
                    <strong>{photo.name}</strong>
                    <span>{photo.sizeLabel}</span>
                  </div>
                  <div className="photo-card-actions">
                    <button type="button" className="secondary-button" onClick={() => setPrimaryPhotoId(photo.id)}>
                      {primaryPhotoId === photo.id ? 'Primary Photo' : 'Set Primary'}
                    </button>
                    <button type="button" className="secondary-button" onClick={() => removePhoto(photo.id)}>
                      Remove
                    </button>
                  </div>
                </article>
              )) : (
                <div className="empty-box">
                  <strong>No photos uploaded yet</strong>
                  <span>Add at least one image to continue.</span>
                </div>
              )}
            </div>

            <PageFooter
              helper={photos.length ? photos.length + ' photo(s) added. Select the main reference before moving on.' : 'Upload photos first.'}
              primaryLabel="Continue to Product Details"
              primaryDisabled={!completion.upload}
              onPrimary={() => goToScreen('details')}
            />
          </section>
        ) : null}

        {screen === 'details' ? (
          <section className="page-card">
            <div className="page-head">
              <p className="eyebrow">{stepMeta.details.eyebrow}</p>
              <h2>Fill product details</h2>
              <p>This page is only for product truth. Keep it accurate so office output stays usable.</p>
            </div>

            <div className="form-grid">
              <label className="field full">
                <span>Product Title</span>
                <input value={details.title} onChange={(event) => onDetailFieldChange('title', event.target.value)} placeholder="Example: Maroon zari saree" />
              </label>
              <label className="field">
                <span>Fabric</span>
                <input value={details.fabric} onChange={(event) => onDetailFieldChange('fabric', event.target.value)} placeholder="Cotton silk, georgette, satin" />
              </label>
              <label className="field">
                <span>Color / Palette</span>
                <input value={details.palette} onChange={(event) => onDetailFieldChange('palette', event.target.value)} placeholder="Maroon with gold border" />
              </label>
              <label className="field full">
                <span>Pattern / Print</span>
                <input value={details.pattern} onChange={(event) => onDetailFieldChange('pattern', event.target.value)} placeholder="Floral print, zari border, thread work" />
              </label>
              <label className="field">
                <span>Fit / Silhouette</span>
                <input value={details.silhouette} onChange={(event) => onDetailFieldChange('silhouette', event.target.value)} placeholder="Straight fit, free drape, fitted blouse" />
              </label>
              <label className="field">
                <span>Neckline / Collar</span>
                <input value={details.neckline} onChange={(event) => onDetailFieldChange('neckline', event.target.value)} placeholder="Round neck, mandarin collar" />
              </label>
              <label className="field">
                <span>Sleeves</span>
                <input value={details.sleeves} onChange={(event) => onDetailFieldChange('sleeves', event.target.value)} placeholder="Sleeveless, full sleeves, three-quarter" />
              </label>
              <label className="field">
                <span>Embellishment</span>
                <input value={details.embellishment} onChange={(event) => onDetailFieldChange('embellishment', event.target.value)} placeholder="Zari, mirror work, buttons, lace" />
              </label>
              <label className="field full">
                <span>Extra Notes</span>
                <textarea rows="4" value={details.notes} onChange={(event) => onDetailFieldChange('notes', event.target.value)} placeholder="Any office notes or special handling details" />
              </label>
            </div>

            <PageFooter
              helper="Fill at least the main product fields before going ahead."
              primaryLabel="Continue to Creative Setup"
              primaryDisabled={!completion.details}
              onPrimary={() => goToScreen('creative')}
            />
          </section>
        ) : null}

        {screen === 'creative' ? (
          <section className="page-card">
            <div className="page-head">
              <p className="eyebrow">{stepMeta.creative.eyebrow}</p>
              <h2>Choose output style</h2>
              <p>This page controls how the final output should look. Product truth is already fixed in the previous step.</p>
            </div>

            <div className="preset-grid">
              {presetOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={joinClasses('preset-card', creative.presetId === option.id && 'preset-card-active')}
                  onClick={() => onCreativeFieldChange('presetId', option.id)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>

            <div className="form-grid">
              <label className="field full">
                <span>Model Direction</span>
                <textarea rows="3" value={creative.modelDirection} onChange={(event) => onCreativeFieldChange('modelDirection', event.target.value)} placeholder="Example: Indian female model, premium posture, textile visible clearly" />
              </label>
              <label className="field">
                <span>Pose</span>
                <select value={creative.pose} onChange={(event) => onCreativeFieldChange('pose', event.target.value)}>
                  {poseOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Background</span>
                <select value={creative.background} onChange={(event) => onCreativeFieldChange('background', event.target.value)}>
                  {backgroundOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Lighting</span>
                <input value={creative.lighting} onChange={(event) => onCreativeFieldChange('lighting', event.target.value)} placeholder="Soft studio, hard contrast, ad-light" />
              </label>
              <label className="field">
                <span>Camera</span>
                <input value={creative.camera} onChange={(event) => onCreativeFieldChange('camera', event.target.value)} placeholder="Front full length, 85mm mid shot" />
              </label>
              <label className="field full">
                <span>Styling</span>
                <textarea rows="3" value={creative.styling} onChange={(event) => onCreativeFieldChange('styling', event.target.value)} placeholder="Minimal jewelry, clean hair, premium commercial styling" />
              </label>
              <label className="field full">
                <span>Video Motion</span>
                <select value={creative.videoMotion} onChange={(event) => onCreativeFieldChange('videoMotion', event.target.value)}>
                  {motionOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
            </div>

            <PageFooter
              helper="Once output style is fixed, review everything and start the work."
              primaryLabel="Continue to Review"
              primaryDisabled={!completion.creative}
              onPrimary={() => goToScreen('review')}
            />
          </section>
        ) : null}

        {screen === 'review' ? (
          <section className="page-card">
            <div className="page-head">
              <p className="eyebrow">{stepMeta.review.eyebrow}</p>
              <h2>Review and start work</h2>
              <p>This is the office handoff page. Check job setup, references, details, and prompt output before starting.</p>
            </div>

            <div className="summary-grid">
              <SummaryCard title="Work Setup" rows={[
                ['Job Name', job.jobName || 'Not set'],
                ['Work Type', job.workType],
                ['Garment', job.garmentType],
                ['Audience', job.audience],
                ['Intent', job.outputIntent],
              ]} />
              <SummaryCard title="References" rows={[
                ['Photos Added', String(photos.length)],
                ['Primary Photo', photos.find((photo) => photo.id === primaryPhotoId)?.name || 'Not selected'],
                ['Brand / Client', job.brandName || 'Not set'],
              ]} />
            </div>

            <div className="prompt-stack">
              <PromptCard label="Image Prompt" body={prompts.image} />
              {(job.workType === 'video' || job.workType === 'image-video') ? (
                <PromptCard label="Video Prompt" body={prompts.video} />
              ) : null}
            </div>

            <div className="review-actions">
              <button type="button" className="primary-button" onClick={startOutputJobs}>
                Start Work Now
              </button>
              <button type="button" className="secondary-button" onClick={() => goToScreen('setup')}>
                Edit Setup
              </button>
            </div>

            <div className="job-list">
              {jobs.length ? jobs.map((item) => (
                <article key={item.id} className="job-card">
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.note}</p>
                  </div>
                  <span className="status-tag">{item.kind} • {item.status}</span>
                </article>
              )) : (
                <div className="empty-box">
                  <strong>No work started yet</strong>
                  <span>Use the button above after review is complete.</span>
                </div>
              )}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  )
}

function PageFooter({ helper, primaryLabel, primaryDisabled, onPrimary }) {
  return (
    <div className="page-footer">
      <span>{helper}</span>
      <button type="button" className="primary-button" disabled={primaryDisabled} onClick={onPrimary}>
        {primaryLabel}
      </button>
    </div>
  )
}

function SummaryCard({ title, rows }) {
  return (
    <article className="summary-card">
      <strong>{title}</strong>
      <div className="summary-rows">
        {rows.map((row) => (
          <div key={row[0]} className="summary-row">
            <span>{row[0]}</span>
            <b>{row[1]}</b>
          </div>
        ))}
      </div>
    </article>
  )
}

function PromptCard({ label, body }) {
  return (
    <article className="prompt-card">
      <span>{label}</span>
      <p>{body}</p>
    </article>
  )
}

function MetricCard({ label, value, helper }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{helper}</p>
    </article>
  )
}

export default App
