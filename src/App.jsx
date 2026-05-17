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

const garmentDefaults = {
  Saree: {
    title: 'Textile-accurate saree mockup',
    fabric: 'Keep fabric as close as possible to the uploaded saree reference with realistic drape and fall.',
    palette: 'Match the uploaded saree colors exactly, including blouse, border, and pallu contrast.',
    pattern: 'Preserve print scale, border placement, motifs, zari lines, and pallu detailing from the reference.',
    silhouette: 'Natural saree drape with blouse proportion that supports clear textile visibility.',
    neckline: 'Commercial blouse neckline consistent with the uploaded blouse styling or a clean round neck.',
    sleeves: 'Sleeve length should stay realistic for the blouse and should not hide the textile.',
    embellishment: 'Keep zari, embroidery, lace, stones, tassels, and edging exactly as visible in the reference.',
    notes: 'Do not redesign the saree. Avoid changing border width, print placement, or fabric drape.',
  },
  Kurti: {
    title: 'Textile-accurate kurti mockup',
    fabric: 'Keep the kurti fabric true to the uploaded reference with natural folds and stitching.',
    palette: 'Preserve the exact garment colors and contrast panels visible in the reference.',
    pattern: 'Retain print direction, panel work, embroidery, and button or piping details.',
    silhouette: 'Straight or A-line silhouette matching the garment construction in the image.',
    neckline: 'Maintain the same neckline family as the uploaded garment unless specified otherwise.',
    sleeves: 'Match sleeve length and cuff style to the reference garment.',
    embellishment: 'Preserve thread work, lace, buttons, mirror work, and trim placement.',
    notes: 'Keep the kurti wearable and production-accurate. Do not invent extra design panels.',
  },
  Lehenga: {
    title: 'Textile-accurate lehenga mockup',
    fabric: 'Preserve heavy textile texture, flare volume, and blouse-dupatta coordination from the reference.',
    palette: 'Match all lehenga set colors exactly across skirt, blouse, and dupatta.',
    pattern: 'Keep embroidery density, border placement, panel rhythm, and motif scale accurate.',
    silhouette: 'Full lehenga set with believable flare, waist proportion, and dupatta styling.',
    neckline: 'Use a premium bridal or festive neckline aligned with the blouse reference.',
    sleeves: 'Preserve blouse sleeve cut and embellishment style.',
    embellishment: 'Keep zari, sequins, mirror work, stones, and embroidery exactly aligned to the set.',
    notes: 'Protect outfit richness while keeping the textile fully readable and not over-stylized.',
  },
  Blouse: {
    title: 'Textile-accurate blouse mockup',
    fabric: 'Keep blouse fabric, structure, and stitch definition realistic.',
    palette: 'Preserve the exact blouse color and contrast trims from the reference.',
    pattern: 'Retain embroidery, back pattern, piping, and neckline finishing details.',
    silhouette: 'Fitted blouse shape with realistic bust, shoulder, and sleeve construction.',
    neckline: 'Use the neckline visible in the uploaded blouse photo.',
    sleeves: 'Keep sleeve cut and length true to the garment reference.',
    embellishment: 'Preserve handwork, beads, lace, and border finishing without adding extra decoration.',
    notes: 'Avoid anatomy distortion and avoid changing blouse cut for style only.',
  },
  Dupatta: {
    title: 'Textile-accurate dupatta mockup',
    fabric: 'Keep dupatta fabric transparency, fall, and border weight accurate.',
    palette: 'Match dupatta base color, gradients, and border contrast exactly.',
    pattern: 'Preserve border rhythm, motifs, and scattered design placements.',
    silhouette: 'Natural dupatta drape across shoulders or arms with full textile readability.',
    neckline: 'Not applicable; keep focus on the dupatta styling and drape.',
    sleeves: 'Not applicable; ensure styling does not block the dupatta design.',
    embellishment: 'Keep lace, gota, tassels, embroidery, and sequins exactly placed.',
    notes: 'Show enough spread so the dupatta design can be checked clearly.',
  },
  Gown: {
    title: 'Textile-accurate gown mockup',
    fabric: 'Keep gown fabric weight, shine, and flow true to the uploaded garment.',
    palette: 'Preserve exact gown colors, lining hints, and contrast details.',
    pattern: 'Retain embroidery, panel joins, flare texture, and surface pattern.',
    silhouette: 'Maintain the gown cut and flare without changing garment construction.',
    neckline: 'Keep neckline family close to the uploaded gown reference.',
    sleeves: 'Preserve sleeve length and transparency details if present.',
    embellishment: 'Retain bead work, applique, sequins, lace, and embellishment density.',
    notes: 'Avoid extra fantasy styling that changes the actual production garment.',
  },
  Shirt: {
    title: 'Textile-accurate shirt mockup',
    fabric: 'Preserve shirt fabric crispness, folds, and stitch lines.',
    palette: 'Match garment colors, stripes, checks, and trims exactly.',
    pattern: 'Keep print repeat, placket detail, pocket position, and collar detailing accurate.',
    silhouette: 'Commercial shirt fit with realistic shoulder, collar, and hem structure.',
    neckline: 'Keep collar and neck opening accurate to the reference shirt.',
    sleeves: 'Preserve sleeve length, cuff styling, and fold details.',
    embellishment: 'Retain buttons, patch work, embroidery, and trim details only if present.',
    notes: 'Keep the shirt practical and clean without adding fashion noise.',
  },
  'Kids Wear': {
    title: 'Textile-accurate kids wear mockup',
    fabric: 'Preserve fabric softness and construction appropriate for kids wear.',
    palette: 'Keep garment colors and playful contrast exactly as uploaded.',
    pattern: 'Retain prints, badges, borders, and trim placement accurately.',
    silhouette: 'Comfortable kids wear fit matching the uploaded garment cut.',
    neckline: 'Keep neck opening and closure style aligned with the garment.',
    sleeves: 'Maintain realistic sleeve length and proportion for kids wear.',
    embellishment: 'Preserve safe trims, small embroidery, badges, and detailing without exaggeration.',
    notes: 'Keep proportions natural and garment truth more important than styling tricks.',
  },
  Other: {
    title: 'Textile-accurate fashion mockup',
    fabric: 'Keep the fabric close to the uploaded cloth reference with realistic folds and texture.',
    palette: 'Preserve exact garment colors and contrast from the uploaded image.',
    pattern: 'Retain print placement, motifs, and texture truth from the reference.',
    silhouette: 'Match the construction and overall garment shape seen in the uploaded image.',
    neckline: 'Use the neckline or collar family visible in the reference.',
    sleeves: 'Use sleeve details visible in the uploaded reference.',
    embellishment: 'Retain all visible trims, embroidery, and textile detailing accurately.',
    notes: 'Do not redesign the garment. Keep textile truth higher than creativity.',
  },
}

const creativeDefaultsByIntent = {
  Catalog: {
    presetId: 'catalog',
    modelDirection: 'Commercial Indian fashion model, confident straight posture, full garment visible, textile clearly readable.',
    pose: 'Front Straight',
    background: 'White Studio',
    lighting: 'Soft studio daylight with even exposure and true fabric color.',
    camera: 'Front full-length frame with sharp focus on the garment and border details.',
    styling: 'Minimal accessories, clean grooming, no props blocking the textile.',
    videoMotion: 'Slow Turn',
  },
  'Creative Campaign': {
    presetId: 'premium',
    modelDirection: 'Premium Indian fashion model with editorial confidence while keeping the textile fully visible.',
    pose: 'Walking Three-Quarter',
    background: 'Warm Beige Studio',
    lighting: 'Luxury campaign lighting with depth, but accurate color retention.',
    camera: 'Three-quarter fashion frame with textile detail preserved.',
    styling: 'Refined premium styling, controlled accessories, elegant hair and clean silhouette.',
    videoMotion: 'Fabric Flow Reveal',
  },
  'Marketplace Listing': {
    presetId: 'catalog',
    modelDirection: 'Marketplace-ready model pose with practical garment visibility and low styling noise.',
    pose: 'Front Straight',
    background: 'Soft Gradient Backdrop',
    lighting: 'Flat balanced lighting for ecommerce clarity and accurate textile color.',
    camera: 'Centered product frame showing most of the garment without distortion.',
    styling: 'Low-noise styling, neutral accessories, product-first presentation.',
    videoMotion: 'Detail Reveal',
  },
  'Social Reel': {
    presetId: 'social',
    modelDirection: 'Social-first Indian fashion model with expressive but controlled movement and clear textile presentation.',
    pose: 'Side Detail Pose',
    background: 'Festive Set',
    lighting: 'High-contrast social lighting with visible texture and protected color accuracy.',
    camera: 'Dynamic vertical-friendly frame with close textile readability.',
    styling: 'Styled but not distracting, movement-friendly drape, camera-facing textile moments.',
    videoMotion: 'Runway Walk',
  },
}

const uploadTips = [
  'Upload one full front image where the whole garment is clearly visible.',
  'Add one close-up image for fabric, border, embroidery, or print texture.',
  'Use bright, even lighting. Avoid yellow light, blur, filters, and heavy shadows.',
  'Keep the cloth on a clean background so edge detection stays accurate.',
  'If color is important, avoid overexposed photos and keep white balance natural.',
]

const quickChecks = [
  'Preserve exact cloth identity from the uploaded image.',
  'Avoid adding extra motifs, borders, embroidery, or accessories.',
  'Keep drape, proportions, and stitching believable.',
  'Use the generated prompt directly in Google Flow with the same reference image.',
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

function withFallback(value, fallback) {
  return String(value || '').trim() || fallback
}

function buildSuggestedJobName(job) {
  return withFallback(job.jobName, job.garmentType + ' ' + job.outputIntent + ' prompt set')
}

function buildResolvedDetails(job, details) {
  const defaults = garmentDefaults[job.garmentType] || garmentDefaults.Other
  return {
    title: withFallback(details.title, defaults.title),
    fabric: withFallback(details.fabric, defaults.fabric),
    palette: withFallback(details.palette, defaults.palette),
    pattern: withFallback(details.pattern, defaults.pattern),
    silhouette: withFallback(details.silhouette, defaults.silhouette),
    neckline: withFallback(details.neckline, defaults.neckline),
    sleeves: withFallback(details.sleeves, defaults.sleeves),
    embellishment: withFallback(details.embellishment, defaults.embellishment),
    notes: withFallback(details.notes, defaults.notes),
  }
}

function buildResolvedCreative(job, creative) {
  const defaults = creativeDefaultsByIntent[job.outputIntent] || creativeDefaultsByIntent.Catalog
  return {
    presetId: withFallback(creative.presetId, defaults.presetId),
    modelDirection: withFallback(creative.modelDirection, defaults.modelDirection),
    pose: withFallback(creative.pose, defaults.pose),
    background: withFallback(creative.background, defaults.background),
    lighting: withFallback(creative.lighting, defaults.lighting),
    camera: withFallback(creative.camera, defaults.camera),
    styling: withFallback(creative.styling, defaults.styling),
    videoMotion: withFallback(creative.videoMotion, defaults.videoMotion),
  }
}

function buildImagePrompt(job, details, creative, presetLabel, photoCount, primaryPhotoName) {
  return [
    'Goal:',
    'Create a highly realistic ' + job.garmentType.toLowerCase() + ' mockup for ' + job.audience.toLowerCase() + ' wear.',
    '',
    'Reference Image Rule:',
    'Use the uploaded primary cloth photo "' + primaryPhotoName + '" as the truth source. Keep textile identity exact across color, border, print scale, embroidery, embellishment, and drape. Do not redesign the garment.',
    '',
    'Output Direction:',
    'Intent: ' + job.outputIntent + '. Work type: ' + job.workType + '. Preset: ' + presetLabel + '. Use ' + photoCount + ' uploaded reference photo(s) to maintain accuracy.',
    '',
    'Product Details:',
    'Title: ' + details.title + '. Fabric: ' + details.fabric + '. Palette: ' + details.palette + '. Pattern: ' + details.pattern + '. Silhouette: ' + details.silhouette + '. Neckline: ' + details.neckline + '. Sleeves: ' + details.sleeves + '. Embellishment: ' + details.embellishment + '.',
    '',
    'Model And Scene:',
    'Model direction: ' + creative.modelDirection + '. Pose: ' + creative.pose + '. Background: ' + creative.background + '. Lighting: ' + creative.lighting + '. Camera: ' + creative.camera + '. Styling: ' + creative.styling + '.',
    '',
    'Quality Guardrails:',
    'Keep the textile fully readable. Avoid warped borders, wrong print density, extra decorations, anatomy distortion, and color shifts.',
    '',
    'Notes:',
    details.notes,
  ].join('\n')
}

function buildGoogleFlowPrompt(job, details, creative, presetLabel, primaryPhotoName) {
  return [
    'Use the uploaded cloth image "' + primaryPhotoName + '" as the main reference.',
    'Generate one premium ' + job.garmentType.toLowerCase() + ' fashion mockup for ' + job.audience.toLowerCase() + ' wear.',
    'Preserve exact textile identity, color, border, print scale, embroidery, and fabric drape from the reference image.',
    'Intent: ' + job.outputIntent + '. Preset style: ' + presetLabel + '.',
    'Fabric: ' + details.fabric + '. Palette: ' + details.palette + '. Pattern: ' + details.pattern + '.',
    'Silhouette: ' + details.silhouette + '. Neckline: ' + details.neckline + '. Sleeves: ' + details.sleeves + '.',
    'Embellishment: ' + details.embellishment + '.',
    'Model direction: ' + creative.modelDirection + '. Pose: ' + creative.pose + '. Background: ' + creative.background + '.',
    'Lighting: ' + creative.lighting + '. Camera: ' + creative.camera + '. Styling: ' + creative.styling + '.',
    'Do not invent new motifs, borders, accessories, or color changes. Keep the garment production-accurate and commercially usable.',
  ].join('\n')
}

function buildVideoPrompt(job, details, creative, presetLabel, primaryPhotoName) {
  return [
    'Use the uploaded cloth image "' + primaryPhotoName + '" as the primary garment reference.',
    'Create a short product video for a ' + job.garmentType.toLowerCase() + ' for ' + job.audience.toLowerCase() + ' wear.',
    'Intent: ' + job.outputIntent + '. Preset: ' + presetLabel + '. Keep fabric and textile truth accurate throughout the motion.',
    'Retain fabric, palette, pattern, and embellishment exactly: ' + details.fabric + '; ' + details.palette + '; ' + details.pattern + '; ' + details.embellishment + '.',
    'Base pose: ' + creative.pose + '. Motion: ' + creative.videoMotion + '. Background: ' + creative.background + '.',
    'Lighting: ' + creative.lighting + '. Camera: ' + creative.camera + '. Styling: ' + creative.styling + '.',
    'Avoid unrealistic cloth physics, sudden design changes, and loss of border detail.',
  ].join('\n')
}

async function copyText(value, onDone) {
  if (!globalThis.navigator || !globalThis.navigator.clipboard) return
  try {
    await globalThis.navigator.clipboard.writeText(value)
    onDone(true)
  } catch {
    onDone(false)
  }
}

function App() {
  const [screen, setScreen] = useState(getHashScreen())
  const [job, setJob] = useState(initialJob)
  const [details, setDetails] = useState(initialDetails)
  const [creative, setCreative] = useState(initialCreative)
  const [photos, setPhotos] = useState([])
  const [primaryPhotoId, setPrimaryPhotoId] = useState('')
  const [jobs, setJobs] = useState([])
  const [copyState, setCopyState] = useState('')

  useEffect(() => {
    const onHashChange = () => setScreen(getHashScreen())
    globalThis.addEventListener('hashchange', onHashChange)
    return () => globalThis.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (!copyState) return undefined
    const timeoutId = globalThis.setTimeout(() => setCopyState(''), 1600)
    return () => globalThis.clearTimeout(timeoutId)
  }, [copyState])

  const primaryPhoto = photos.find((photo) => photo.id === primaryPhotoId) || photos[0] || null
  const resolvedDetails = useMemo(() => buildResolvedDetails(job, details), [job, details])
  const resolvedCreative = useMemo(() => buildResolvedCreative(job, creative), [job, creative])
  const preset = presetOptions.find((item) => item.id === resolvedCreative.presetId) || presetOptions[0]

  const completion = useMemo(() => {
    const detailCount = Object.values(details).filter((value) => String(value || '').trim()).length
    return {
      setup: Boolean(job.garmentType && job.audience && job.workType),
      upload: photos.length > 0 && Boolean(primaryPhoto),
      details: detailCount >= 6,
      creative: Boolean(creative.modelDirection && creative.lighting && creative.camera),
      review: jobs.length > 0,
    }
  }, [creative, details, job, jobs.length, photos.length, primaryPhoto])

  const currentStepIndex = stepOrder.indexOf(screen)
  const nextStep = currentStepIndex >= 0 ? stepOrder[currentStepIndex + 1] || null : 'setup'
  const previousStep = currentStepIndex > 0 ? stepOrder[currentStepIndex - 1] : null

  const prompts = useMemo(() => {
    const primaryPhotoName = primaryPhoto ? primaryPhoto.name : 'primary reference image'
    return {
      image: buildImagePrompt(job, resolvedDetails, resolvedCreative, preset.label, photos.length, primaryPhotoName),
      googleFlow: buildGoogleFlowPrompt(job, resolvedDetails, resolvedCreative, preset.label, primaryPhotoName),
      video: buildVideoPrompt(job, resolvedDetails, resolvedCreative, preset.label, primaryPhotoName),
    }
  }, [job, photos.length, preset.label, primaryPhoto, resolvedCreative, resolvedDetails])

  const canMove = {
    setup: true,
    upload: true,
    details: completion.upload,
    creative: completion.details,
    review: completion.creative || completion.upload,
  }

  const goToScreen = (nextScreen) => {
    if (!nextScreen) return
    setScreen(nextScreen)
    globalThis.location.hash = nextScreen === 'home' ? 'home' : nextScreen
  }

  const startGuidedFlow = () => {
    goToScreen('setup')
  }

  const startQuickFlow = () => {
    goToScreen('upload')
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

  const applySuggestions = () => {
    setJob((prev) => ({ ...prev, jobName: buildSuggestedJobName(prev) }))
    setDetails(resolvedDetails)
    setCreative(resolvedCreative)
    goToScreen('details')
  }

  const startOutputJobs = () => {
    const nextJobs = []

    if (job.workType === 'image' || job.workType === 'image-video') {
      nextJobs.push({
        id: createId(),
        kind: 'Image',
        title: buildSuggestedJobName(job) + ' image job',
        status: 'Prompt Ready',
        note: 'Google Flow prompt and mockup briefing are ready from the review page.',
      })
    }

    if (job.workType === 'video' || job.workType === 'image-video') {
      nextJobs.push({
        id: createId(),
        kind: 'Video',
        title: buildSuggestedJobName(job) + ' video job',
        status: 'Prompt Ready',
        note: 'Video motion prompt is prepared with textile-safe guardrails.',
      })
    }

    setJobs((prev) => nextJobs.concat(prev))
  }

  const onCopyPrompt = async (key, value) => {
    await copyText(value, (ok) => setCopyState(ok ? key : 'failed'))
  }

  if (screen === 'home') {
    return (
      <div className="landing-shell">
        <section className="landing-card">
          <p className="eyebrow">Miraai Textile AI</p>
          <h1 className="landing-title">Upload cloth image and get prompt + mockup direction fast</h1>
          <p className="landing-copy">
            You can still use the full step-by-step workflow, but now there is also a faster lane: upload the cloth image, get a detailed prompt instantly, and copy a Google Flow-ready version directly.
          </p>

          <div className="landing-steps">
            <article className="landing-step">
              <strong>1. Upload Image</strong>
              <span>Add one clear cloth photo and mark the main reference.</span>
            </article>
            <article className="landing-step">
              <strong>2. Get Prompt Fast</strong>
              <span>The app generates a detailed mockup prompt and Google Flow copy version.</span>
            </article>
            <article className="landing-step">
              <strong>3. Refine If Needed</strong>
              <span>Apply the suggestions into editable fields and continue the full workflow.</span>
            </article>
          </div>

          <div className="landing-actions">
            <button type="button" className="primary-button landing-start-button" onClick={startQuickFlow}>
              Quick Prompt From Image
            </button>
            <button type="button" className="secondary-button landing-start-button" onClick={startGuidedFlow}>
              Full Guided Workflow
            </button>
          </div>
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
          <p className="wizard-copy">
            {screen === 'upload'
              ? 'Upload first. The app will immediately prepare a detailed prompt, Google Flow copy text, and a mockup direction card.'
              : 'One step at a time. Finish this page, then move to the next.'}
          </p>
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
              <p>Choose what kind of output you want. You can also skip this and jump straight to upload if speed matters more.</p>
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
              helper="You can continue normally, or use quick upload from the next step."
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
              <p>Add one or more cloth photos. As soon as you set the main image, the app prepares a detailed prompt and instant mockup direction below.</p>
            </div>

            <label className="upload-box">
              <input type="file" accept="image/*" multiple onChange={onPhotoUpload} />
              <strong>Add cloth photos</strong>
              <span>Best results come from one full view plus one close-up of texture, border, embroidery, or print.</span>
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
                  <span>Add at least one image to generate the direct prompt flow.</span>
                </div>
              )}
            </div>

            {completion.upload ? (
              <section className="quick-lane">
                <div className="quick-lane-head">
                  <div>
                    <p className="eyebrow">Quick Prompt Lane</p>
                    <h3>Direct detailed prompt + mockup direction</h3>
                    <p>Upload complete. This section is the fastest path: copy the prompt into Google Flow or push the suggestions into editable form fields.</p>
                  </div>
                  <div className="quick-lane-actions">
                    <button type="button" className="primary-button" onClick={() => onCopyPrompt('google-flow', prompts.googleFlow)}>
                      {copyState === 'google-flow' ? 'Copied' : 'Copy Google Flow Prompt'}
                    </button>
                    <button type="button" className="secondary-button" onClick={applySuggestions}>
                      Apply Suggestions To Form
                    </button>
                  </div>
                </div>

                <div className="quick-grid">
                  <article className="mockup-card">
                    <div className="mockup-preview">
                      <img src={primaryPhoto ? primaryPhoto.previewUrl : ''} alt={primaryPhoto ? primaryPhoto.name : 'Primary cloth preview'} />
                      <div className="mockup-overlay">
                        <span className="mockup-chip">{job.garmentType}</span>
                        <span className="mockup-chip">{preset.label}</span>
                        <span className="mockup-chip">{resolvedCreative.pose}</span>
                      </div>
                    </div>
                    <div className="mockup-copy">
                      <strong>Instant mockup brief</strong>
                      <p>This is the visual direction card for the AI output. Use it to confirm styling before you test the prompt in Google Flow.</p>
                      <div className="mockup-points">
                        <span>Background: {resolvedCreative.background}</span>
                        <span>Lighting: {resolvedCreative.lighting}</span>
                        <span>Camera: {resolvedCreative.camera}</span>
                        <span>Texture focus: {resolvedDetails.pattern}</span>
                      </div>
                    </div>
                  </article>

                  <article className="guide-card">
                    <div className="guide-block">
                      <strong>Upload for better accuracy</strong>
                      <ul className="guide-list">
                        {uploadTips.map((tip) => <li key={tip}>{tip}</li>)}
                      </ul>
                    </div>
                    <div className="guide-block">
                      <strong>Prompt quality checks</strong>
                      <ul className="guide-list">
                        {quickChecks.map((tip) => <li key={tip}>{tip}</li>)}
                      </ul>
                    </div>
                  </article>
                </div>

                <div className="prompt-stack">
                  <PromptCard
                    label="Google Flow Prompt"
                    body={prompts.googleFlow}
                    note="Paste this into Google Flow with the same uploaded cloth image."
                    actionLabel={copyState === 'google-flow-inline' ? 'Copied' : 'Copy'}
                    onAction={() => onCopyPrompt('google-flow-inline', prompts.googleFlow)}
                  />
                  <PromptCard
                    label="Detailed Image Prompt"
                    body={prompts.image}
                    note="This version is more explicit and useful when you want to inspect the full prompt logic."
                    actionLabel={copyState === 'image-prompt' ? 'Copied' : 'Copy'}
                    onAction={() => onCopyPrompt('image-prompt', prompts.image)}
                  />
                </div>
              </section>
            ) : null}

            <PageFooter
              helper={photos.length ? photos.length + ' photo(s) added. Set the main photo to unlock direct prompt generation.' : 'Upload photos first.'}
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
              <p>Edit the auto-suggested values here if you want tighter prompt control before generation.</p>
            </div>

            <div className="form-grid">
              <label className="field full">
                <span>Product Title</span>
                <input value={details.title} onChange={(event) => onDetailFieldChange('title', event.target.value)} placeholder={resolvedDetails.title} />
              </label>
              <label className="field">
                <span>Fabric</span>
                <input value={details.fabric} onChange={(event) => onDetailFieldChange('fabric', event.target.value)} placeholder={resolvedDetails.fabric} />
              </label>
              <label className="field">
                <span>Color / Palette</span>
                <input value={details.palette} onChange={(event) => onDetailFieldChange('palette', event.target.value)} placeholder={resolvedDetails.palette} />
              </label>
              <label className="field full">
                <span>Pattern / Print</span>
                <input value={details.pattern} onChange={(event) => onDetailFieldChange('pattern', event.target.value)} placeholder={resolvedDetails.pattern} />
              </label>
              <label className="field">
                <span>Fit / Silhouette</span>
                <input value={details.silhouette} onChange={(event) => onDetailFieldChange('silhouette', event.target.value)} placeholder={resolvedDetails.silhouette} />
              </label>
              <label className="field">
                <span>Neckline / Collar</span>
                <input value={details.neckline} onChange={(event) => onDetailFieldChange('neckline', event.target.value)} placeholder={resolvedDetails.neckline} />
              </label>
              <label className="field">
                <span>Sleeves</span>
                <input value={details.sleeves} onChange={(event) => onDetailFieldChange('sleeves', event.target.value)} placeholder={resolvedDetails.sleeves} />
              </label>
              <label className="field">
                <span>Embellishment</span>
                <input value={details.embellishment} onChange={(event) => onDetailFieldChange('embellishment', event.target.value)} placeholder={resolvedDetails.embellishment} />
              </label>
              <label className="field full">
                <span>Extra Notes</span>
                <textarea rows="4" value={details.notes} onChange={(event) => onDetailFieldChange('notes', event.target.value)} placeholder={resolvedDetails.notes} />
              </label>
            </div>

            <PageFooter
              helper="Tighten product truth here if the auto-suggested prompt needs correction."
              primaryLabel="Continue to Creative Setup"
              primaryDisabled={!completion.upload}
              onPrimary={() => goToScreen('creative')}
            />
          </section>
        ) : null}

        {screen === 'creative' ? (
          <section className="page-card">
            <div className="page-head">
              <p className="eyebrow">{stepMeta.creative.eyebrow}</p>
              <h2>Choose output style</h2>
              <p>These controls refine the generated image or video prompt without changing the core textile truth.</p>
            </div>

            <div className="preset-grid">
              {presetOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={joinClasses('preset-card', resolvedCreative.presetId === option.id && 'preset-card-active')}
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
                <textarea rows="3" value={creative.modelDirection} onChange={(event) => onCreativeFieldChange('modelDirection', event.target.value)} placeholder={resolvedCreative.modelDirection} />
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
                <input value={creative.lighting} onChange={(event) => onCreativeFieldChange('lighting', event.target.value)} placeholder={resolvedCreative.lighting} />
              </label>
              <label className="field">
                <span>Camera</span>
                <input value={creative.camera} onChange={(event) => onCreativeFieldChange('camera', event.target.value)} placeholder={resolvedCreative.camera} />
              </label>
              <label className="field full">
                <span>Styling</span>
                <textarea rows="3" value={creative.styling} onChange={(event) => onCreativeFieldChange('styling', event.target.value)} placeholder={resolvedCreative.styling} />
              </label>
              <label className="field full">
                <span>Video Motion</span>
                <select value={creative.videoMotion} onChange={(event) => onCreativeFieldChange('videoMotion', event.target.value)}>
                  {motionOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
            </div>

            <PageFooter
              helper="Creative settings now directly affect both prompt cards and the mockup direction."
              primaryLabel="Continue to Review"
              primaryDisabled={!completion.upload}
              onPrimary={() => goToScreen('review')}
            />
          </section>
        ) : null}

        {screen === 'review' ? (
          <section className="page-card">
            <div className="page-head">
              <p className="eyebrow">{stepMeta.review.eyebrow}</p>
              <h2>Review and start work</h2>
              <p>Review the final prompts, copy them into Google Flow if needed, and then mark the output job ready.</p>
            </div>

            <div className="summary-grid">
              <SummaryCard title="Work Setup" rows={[
                ['Job Name', buildSuggestedJobName(job)],
                ['Work Type', job.workType],
                ['Garment', job.garmentType],
                ['Audience', job.audience],
                ['Intent', job.outputIntent],
              ]} />
              <SummaryCard title="References" rows={[
                ['Photos Added', String(photos.length)],
                ['Primary Photo', primaryPhoto ? primaryPhoto.name : 'Not selected'],
                ['Brand / Client', job.brandName || 'Not set'],
                ['Preset', preset.label],
              ]} />
            </div>

            {primaryPhoto ? (
              <article className="mockup-card review-mockup-card">
                <div className="mockup-preview">
                  <img src={primaryPhoto.previewUrl} alt={primaryPhoto.name} />
                  <div className="mockup-overlay">
                    <span className="mockup-chip">{resolvedCreative.background}</span>
                    <span className="mockup-chip">{resolvedCreative.pose}</span>
                    <span className="mockup-chip">{resolvedCreative.videoMotion}</span>
                  </div>
                </div>
                <div className="mockup-copy">
                  <strong>Mockup direction recap</strong>
                  <p>Use this as the final visual brief before you run the prompt outside the app.</p>
                  <div className="mockup-points">
                    <span>Fabric: {resolvedDetails.fabric}</span>
                    <span>Palette: {resolvedDetails.palette}</span>
                    <span>Pattern: {resolvedDetails.pattern}</span>
                    <span>Styling: {resolvedCreative.styling}</span>
                  </div>
                </div>
              </article>
            ) : null}

            <div className="prompt-stack">
              <PromptCard
                label="Google Flow Prompt"
                body={prompts.googleFlow}
                note="Fastest testing path: upload the same image in Google Flow and paste this prompt."
                actionLabel={copyState === 'review-google' ? 'Copied' : 'Copy'}
                onAction={() => onCopyPrompt('review-google', prompts.googleFlow)}
              />
              <PromptCard
                label="Detailed Image Prompt"
                body={prompts.image}
                note="Use this when you want the full explicit generation brief."
                actionLabel={copyState === 'review-image' ? 'Copied' : 'Copy'}
                onAction={() => onCopyPrompt('review-image', prompts.image)}
              />
              {(job.workType === 'video' || job.workType === 'image-video') ? (
                <PromptCard
                  label="Video Prompt"
                  body={prompts.video}
                  note="Video prompt keeps the same textile truth while adding motion direction."
                  actionLabel={copyState === 'review-video' ? 'Copied' : 'Copy'}
                  onAction={() => onCopyPrompt('review-video', prompts.video)}
                />
              ) : null}
            </div>

            <div className="review-actions">
              <button type="button" className="primary-button" onClick={startOutputJobs}>
                Start Work Now
              </button>
              <button type="button" className="secondary-button" onClick={() => goToScreen('upload')}>
                Back To Upload
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
                  <span>Copy the prompt into Google Flow or press the button above to mark the job ready.</span>
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

function PromptCard({ label, body, note, actionLabel, onAction }) {
  return (
    <article className="prompt-card">
      <div className="prompt-card-head">
        <span>{label}</span>
        {onAction ? (
          <button type="button" className="secondary-button prompt-action-button" onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
      </div>
      {note ? <small className="prompt-note">{note}</small> : null}
      <pre className="prompt-body">{body}</pre>
    </article>
  )
}

export default App
