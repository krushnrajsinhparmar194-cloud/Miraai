import { useEffect, useMemo, useState } from 'react'
import './index.css'

const stepOrder = ['setup', 'upload', 'details', 'creative', 'review']

const stepMeta = {
  setup: { label: 'Work Setup', eyebrow: 'Step 1' },
  upload: { label: 'Photo Intake', eyebrow: 'Step 2' },
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

const sareeShotPlan = [
  {
    id: 'saree_full',
    label: 'Full Saree View',
    required: true,
    help: 'Open saree or full drape view where full body, border, and pallu proportions are visible.',
  },
  {
    id: 'pallu_detail',
    label: 'Pallu Detail',
    required: true,
    help: 'Close shot of pallu design, motifs, tassels, zari layout, or contrast area.',
  },
  {
    id: 'border_detail',
    label: 'Border Detail',
    required: true,
    help: 'Close shot of border width, lace, weaving, edging, or side detailing.',
  },
  {
    id: 'blouse_front',
    label: 'Blouse Front',
    required: true,
    help: 'Front blouse reference with neckline, sleeves, color match, and work visibility.',
  },
  {
    id: 'blouse_back',
    label: 'Blouse Back / Sleeve',
    required: false,
    help: 'Back neck, dori, sleeve, cuff, or blouse finishing details.',
  },
  {
    id: 'fabric_closeup',
    label: 'Fabric Close-Up',
    required: true,
    help: 'Texture close-up for fabric feel, weave, embroidery, print density, or shine.',
  },
  {
    id: 'fall_finish',
    label: 'Fall / Finishing',
    required: false,
    help: 'Optional finishing details like fall, edging, stitch line, tassels, or backside finish.',
  },
]

const genericShotPlan = [
  { id: 'main_view', label: 'Main Product View', required: true, help: 'One clean full product image.' },
  { id: 'detail_view', label: 'Detail View', required: true, help: 'One close-up detail image.' },
  { id: 'back_view', label: 'Back View', required: false, help: 'Optional back or side view.' },
]

const garmentDefaults = {
  Saree: {
    title: 'Textile-accurate saree mockup',
    fabric: 'Use the uploaded saree references to preserve exact textile texture, drape, weave, and shine.',
    palette: 'Match saree body, blouse, border, and pallu colors exactly from the uploaded references.',
    pattern: 'Preserve pallu motifs, border rhythm, body print, zari placement, and design scale accurately.',
    silhouette: 'Natural saree drape with a clear view of textile body, border, and pallu flow.',
    neckline: 'Use the blouse neckline from the uploaded blouse reference. If missing, keep it simple and commercial.',
    sleeves: 'Preserve blouse sleeve length, fit, and finishing from the uploaded blouse image.',
    embellishment: 'Retain visible embroidery, zari, lace, stones, tassels, and blouse work exactly.',
    notes: 'Do not redesign the saree. Keep saree body, blouse, pallu, and border identity accurate.',
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

const productionNotes = [
  'Production version should run a vision classifier on every uploaded image and predict labels like saree body, blouse front, pallu, or border with confidence.',
  'Low-confidence predictions should ask the user to confirm or change the shot type before prompt generation starts.',
  'Prompt generation should only become ready when required saree shots exist and low-quality images are replaced or accepted deliberately.',
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

function getShotPlan(garmentType) {
  if (garmentType === 'Saree') return sareeShotPlan
  return genericShotPlan
}

function getShotTypeLabel(garmentType, shotType) {
  const shot = getShotPlan(garmentType).find((item) => item.id === shotType)
  return shot ? shot.label : 'Needs Review'
}

function suggestShotType(name, garmentType) {
  const source = String(name || '').toLowerCase()
  if (garmentType === 'Saree') {
    if (source.includes('blouse') && (source.includes('back') || source.includes('sleeve') || source.includes('neck'))) return 'blouse_back'
    if (source.includes('blouse')) return 'blouse_front'
    if (source.includes('pallu') || source.includes('pallav')) return 'pallu_detail'
    if (source.includes('border') || source.includes('lace') || source.includes('kinari')) return 'border_detail'
    if (source.includes('fabric') || source.includes('texture') || source.includes('close') || source.includes('zoom')) return 'fabric_closeup'
    if (source.includes('fall') || source.includes('finish') || source.includes('inside')) return 'fall_finish'
    if (source.includes('full') || source.includes('front') || source.includes('open') || source.includes('saree')) return 'saree_full'
    return 'unassigned'
  }

  if (source.includes('back') || source.includes('side')) return 'back_view'
  if (source.includes('detail') || source.includes('close') || source.includes('fabric')) return 'detail_view'
  if (source.includes('main') || source.includes('front') || source.includes('full')) return 'main_view'
  return 'unassigned'
}

function evaluatePhotoQuality(photo, garmentType) {
  const issues = []
  const width = photo.width || 0
  const height = photo.height || 0
  const sizeBytes = photo.fileSizeBytes || 0

  if (photo.shotType === 'unassigned') {
    issues.push('Confirm this image type before prompt generation.')
  }

  if (width < 1200 || height < 1200) {
    issues.push('Resolution is low. Upload a sharper image if possible.')
  }

  if (sizeBytes < 180 * 1024) {
    issues.push('Image may be too compressed.')
  }

  if (garmentType === 'Saree' && photo.shotType === 'saree_full' && Math.max(width, height) < 1800) {
    issues.push('Use a higher-resolution full saree image for better drape accuracy.')
  }

  const status = issues.length === 0 ? 'good' : issues.length === 1 ? 'review' : 'bad'
  const label = status === 'good' ? 'Good Shot' : status === 'review' ? 'Review' : 'Replace'
  const score = Math.max(48, 100 - issues.length * 18)

  return { status, label, score, issues }
}

function getCoverageSummary(photos, garmentType) {
  const plan = getShotPlan(garmentType)
  return plan.map((item) => {
    const count = photos.filter((photo) => photo.shotType === item.id).length
    return { ...item, count, done: count > 0 }
  })
}

function buildSuggestedJobName(job) {
  return withFallback(job.jobName, job.garmentType + ' ' + job.outputIntent + ' prompt set')
}

function buildResolvedDetails(job, details, coverage) {
  const defaults = garmentDefaults[job.garmentType] || garmentDefaults.Other
  const hasBlouse = coverage.some((item) => item.id === 'blouse_front' && item.done)
  const hasPallu = coverage.some((item) => item.id === 'pallu_detail' && item.done)
  const hasBorder = coverage.some((item) => item.id === 'border_detail' && item.done)

  return {
    title: withFallback(details.title, defaults.title),
    fabric: withFallback(details.fabric, defaults.fabric),
    palette: withFallback(details.palette, defaults.palette),
    pattern: withFallback(details.pattern, defaults.pattern),
    silhouette: withFallback(details.silhouette, defaults.silhouette),
    neckline: withFallback(details.neckline, hasBlouse ? defaults.neckline : 'No blouse image confirmed yet. Keep blouse neckline simple unless user updates it.'),
    sleeves: withFallback(details.sleeves, hasBlouse ? defaults.sleeves : 'No blouse sleeve reference confirmed yet. Keep sleeves commercially simple unless user updates them.'),
    embellishment: withFallback(details.embellishment, defaults.embellishment),
    notes: withFallback(
      details.notes,
      defaults.notes +
        (hasPallu ? ' Pallu reference is available.' : ' Pallu reference is missing.') +
        (hasBorder ? ' Border detail reference is available.' : ' Border detail reference is missing.')
    ),
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

function buildReferenceLine(photos, garmentType) {
  const summary = getCoverageSummary(photos, garmentType)
    .filter((item) => item.done)
    .map((item) => item.label + ': ' + item.count)
    .join(', ')

  return summary || 'No confirmed reference slots yet.'
}

function buildImagePrompt(job, details, creative, presetLabel, photos, primaryPhotoName) {
  return [
    'Goal:',
    'Create a highly realistic ' + job.garmentType.toLowerCase() + ' mockup for ' + job.audience.toLowerCase() + ' wear.',
    '',
    'Reference Image Rule:',
    'Use the uploaded primary cloth photo "' + primaryPhotoName + '" as the truth source. Keep textile identity exact across saree body, blouse, pallu, border, embroidery, and drape. Do not redesign the garment.',
    '',
    'Reference Coverage:',
    buildReferenceLine(photos, job.garmentType),
    '',
    'Output Direction:',
    'Intent: ' + job.outputIntent + '. Work type: ' + job.workType + '. Preset: ' + presetLabel + '.',
    '',
    'Product Details:',
    'Title: ' + details.title + '. Fabric: ' + details.fabric + '. Palette: ' + details.palette + '. Pattern: ' + details.pattern + '. Silhouette: ' + details.silhouette + '. Neckline: ' + details.neckline + '. Sleeves: ' + details.sleeves + '. Embellishment: ' + details.embellishment + '.',
    '',
    'Model And Scene:',
    'Model direction: ' + creative.modelDirection + '. Pose: ' + creative.pose + '. Background: ' + creative.background + '. Lighting: ' + creative.lighting + '. Camera: ' + creative.camera + '. Styling: ' + creative.styling + '.',
    '',
    'Quality Guardrails:',
    'Keep the textile fully readable. Avoid warped borders, wrong print density, extra decorations, wrong blouse matching, anatomy distortion, and color shifts.',
    '',
    'Notes:',
    details.notes,
  ].join('\n')
}

function buildGoogleFlowPrompt(job, details, creative, presetLabel, photos, primaryPhotoName) {
  return [
    'Use the uploaded cloth image "' + primaryPhotoName + '" as the main reference.',
    'Generate one premium ' + job.garmentType.toLowerCase() + ' fashion mockup for ' + job.audience.toLowerCase() + ' wear.',
    'Preserve exact textile identity, saree body, blouse color match, pallu detailing, border width, print scale, embroidery, and fabric drape from the references.',
    'Reference coverage: ' + buildReferenceLine(photos, job.garmentType) + '.',
    'Intent: ' + job.outputIntent + '. Preset style: ' + presetLabel + '.',
    'Fabric: ' + details.fabric + '. Palette: ' + details.palette + '. Pattern: ' + details.pattern + '.',
    'Silhouette: ' + details.silhouette + '. Neckline: ' + details.neckline + '. Sleeves: ' + details.sleeves + '.',
    'Embellishment: ' + details.embellishment + '.',
    'Model direction: ' + creative.modelDirection + '. Pose: ' + creative.pose + '. Background: ' + creative.background + '.',
    'Lighting: ' + creative.lighting + '. Camera: ' + creative.camera + '. Styling: ' + creative.styling + '.',
    'Do not invent new motifs, borders, accessories, blouse patterns, or color changes. Keep the garment production-accurate and commercially usable.',
  ].join('\n')
}

function buildVideoPrompt(job, details, creative, presetLabel, photos, primaryPhotoName) {
  return [
    'Use the uploaded cloth image "' + primaryPhotoName + '" as the primary garment reference.',
    'Create a short product video for a ' + job.garmentType.toLowerCase() + ' for ' + job.audience.toLowerCase() + ' wear.',
    'Intent: ' + job.outputIntent + '. Preset: ' + presetLabel + '. Keep saree body, blouse, pallu, border, and fabric truth accurate throughout the motion.',
    'Reference coverage: ' + buildReferenceLine(photos, job.garmentType) + '.',
    'Retain fabric, palette, pattern, and embellishment exactly: ' + details.fabric + '; ' + details.palette + '; ' + details.pattern + '; ' + details.embellishment + '.',
    'Base pose: ' + creative.pose + '. Motion: ' + creative.videoMotion + '. Background: ' + creative.background + '.',
    'Lighting: ' + creative.lighting + '. Camera: ' + creative.camera + '. Styling: ' + creative.styling + '.',
    'Avoid unrealistic cloth physics, sudden design changes, and loss of blouse or border detail.',
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

function readImageDimensions(file, previewUrl) {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => resolve({ width: 0, height: 0 })
    image.src = previewUrl
  })
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

  const shotPlan = useMemo(() => getShotPlan(job.garmentType), [job.garmentType])
  const coverage = useMemo(() => getCoverageSummary(photos, job.garmentType), [photos, job.garmentType])
  const requiredMissing = coverage.filter((item) => item.required && !item.done)
  const primaryPhoto = photos.find((photo) => photo.id === primaryPhotoId) || photos.find((photo) => photo.shotType !== 'unassigned') || photos[0] || null
  const qualitySummary = useMemo(() => {
    return {
      good: photos.filter((photo) => photo.quality.status === 'good').length,
      review: photos.filter((photo) => photo.quality.status === 'review').length,
      bad: photos.filter((photo) => photo.quality.status === 'bad').length,
    }
  }, [photos])
  const resolvedDetails = useMemo(() => buildResolvedDetails(job, details, coverage), [job, details, coverage])
  const resolvedCreative = useMemo(() => buildResolvedCreative(job, creative), [job, creative])
  const preset = presetOptions.find((item) => item.id === resolvedCreative.presetId) || presetOptions[0]
  const promptReady = Boolean(primaryPhoto) && requiredMissing.length === 0 && qualitySummary.bad === 0

  const completion = useMemo(() => {
    const detailCount = Object.values(details).filter((value) => String(value || '').trim()).length
    return {
      setup: Boolean(job.garmentType && job.audience && job.workType),
      upload: Boolean(primaryPhoto),
      details: detailCount >= 4 || job.garmentType === 'Saree',
      creative: Boolean(creative.modelDirection && creative.lighting && creative.camera),
      review: jobs.length > 0,
    }
  }, [creative, details, job, jobs.length, primaryPhoto])

  const currentStepIndex = stepOrder.indexOf(screen)
  const nextStep = currentStepIndex >= 0 ? stepOrder[currentStepIndex + 1] || null : 'setup'
  const previousStep = currentStepIndex > 0 ? stepOrder[currentStepIndex - 1] : null

  const prompts = useMemo(() => {
    const primaryPhotoName = primaryPhoto ? primaryPhoto.name : 'primary reference image'
    return {
      image: buildImagePrompt(job, resolvedDetails, resolvedCreative, preset.label, photos, primaryPhotoName),
      googleFlow: buildGoogleFlowPrompt(job, resolvedDetails, resolvedCreative, preset.label, photos, primaryPhotoName),
      video: buildVideoPrompt(job, resolvedDetails, resolvedCreative, preset.label, photos, primaryPhotoName),
    }
  }, [job, photos, preset.label, primaryPhoto, resolvedCreative, resolvedDetails])

  const canMove = {
    setup: true,
    upload: true,
    details: completion.upload,
    creative: completion.upload,
    review: completion.upload,
  }

  const goToScreen = (nextScreen) => {
    if (!nextScreen) return
    setScreen(nextScreen)
    globalThis.location.hash = nextScreen === 'home' ? 'home' : nextScreen
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

  const onPhotoUpload = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    const nextPhotos = await Promise.all(files.map(async (file) => {
      const previewUrl = URL.createObjectURL(file)
      const suggestedType = suggestShotType(file.name, job.garmentType)
      const dimensions = await readImageDimensions(file, previewUrl)
      const quality = evaluatePhotoQuality({
        width: dimensions.width,
        height: dimensions.height,
        shotType: suggestedType,
        fileSizeBytes: file.size,
      }, job.garmentType)

      return {
        id: createId(),
        name: file.name,
        fileSizeBytes: file.size,
        sizeLabel: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        previewUrl,
        width: dimensions.width,
        height: dimensions.height,
        resolutionLabel: dimensions.width && dimensions.height ? dimensions.width + ' × ' + dimensions.height : 'Resolution unavailable',
        shotType: suggestedType,
        classifierHint: suggestedType === 'unassigned' ? 'Needs manual review' : 'Auto-suggested, please confirm',
        quality,
      }
    }))

    setPhotos((prev) => {
      const merged = prev.concat(nextPhotos)
      if (!primaryPhotoId) {
        const preferredPrimary = merged.find((photo) => photo.shotType === 'saree_full' || photo.shotType === 'main_view') || merged[0]
        if (preferredPrimary) setPrimaryPhotoId(preferredPrimary.id)
      }
      return merged
    })

    event.target.value = ''
  }

  const updatePhotoShotType = (photoId, shotType) => {
    setPhotos((prev) => prev.map((photo) => {
      if (photo.id !== photoId) return photo
      const quality = evaluatePhotoQuality({ ...photo, shotType }, job.garmentType)
      return {
        ...photo,
        shotType,
        classifierHint: 'User confirmed',
        quality,
      }
    }))
  }

  const removePhoto = (photoId) => {
    setPhotos((prev) => {
      const next = prev.filter((photo) => photo.id !== photoId)
      if (primaryPhotoId === photoId) {
        const preferredPrimary = next.find((photo) => photo.shotType === 'saree_full' || photo.shotType === 'main_view') || next[0]
        setPrimaryPhotoId(preferredPrimary ? preferredPrimary.id : '')
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
    if (!promptReady) return

    const nextJobs = []

    if (job.workType === 'image' || job.workType === 'image-video') {
      nextJobs.push({
        id: createId(),
        kind: 'Image',
        title: buildSuggestedJobName(job) + ' image job',
        status: 'Prompt Ready',
        note: 'Saree references passed the intake gate and Google Flow prompt is ready.',
      })
    }

    if (job.workType === 'video' || job.workType === 'image-video') {
      nextJobs.push({
        id: createId(),
        kind: 'Video',
        title: buildSuggestedJobName(job) + ' video job',
        status: 'Prompt Ready',
        note: 'Video motion prompt is prepared with saree-safe guardrails.',
      })
    }

    setJobs((prev) => nextJobs.concat(prev))
  }

  const onCopyPrompt = async (key, value) => {
    await copyText(value, (ok) => setCopyState(ok ? key : 'failed'))
  }

  const startQuickFlow = () => goToScreen('upload')
  const startGuidedFlow = () => goToScreen('setup')

  if (screen === 'home') {
    return (
      <div className="landing-shell">
        <section className="landing-card">
          <p className="eyebrow">Miraai Textile AI</p>
          <h1 className="landing-title">Saree-first intake system with prompt + quality gate</h1>
          <p className="landing-copy">
            This version is now focused on one thing properly: saree upload intake. The system asks for saree body, blouse, pallu, border, and texture references before it marks the prompt ready.
          </p>

          <div className="landing-steps">
            <article className="landing-step">
              <strong>1. Upload By Shot Type</strong>
              <span>Saree body, pallu, border, blouse, and fabric shots are tracked separately.</span>
            </article>
            <article className="landing-step">
              <strong>2. Quality Check</strong>
              <span>The intake screen shows missing references, weak images, and manual review items.</span>
            </article>
            <article className="landing-step">
              <strong>3. Prompt Ready Only When Clean</strong>
              <span>Google Flow prompt becomes reliable only after the saree intake coverage is proper.</span>
            </article>
          </div>

          <div className="landing-actions">
            <button type="button" className="primary-button landing-start-button" onClick={startQuickFlow}>
              Start Saree Intake
            </button>
            <button type="button" className="secondary-button landing-start-button" onClick={startGuidedFlow}>
              Open Full Workflow
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
              ? 'This intake screen is saree-first. It separates saree body, blouse, pallu, border, and texture so the prompt does not guess blindly.'
              : 'Finish the intake properly before trusting the prompt output.'}
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
            <button type="button" className="primary-button" disabled={!canMove[nextStep]} onClick={() => goToScreen(nextStep)}>
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
              <p>Right now the detailed intake logic is optimized for saree. Once this is stable, the same system can be expanded to lehenga, kurti, and more.</p>
            </div>

            <div className="form-grid">
              <label className="field full">
                <span>Job Name</span>
                <input value={job.jobName} onChange={(event) => onJobFieldChange('jobName', event.target.value)} placeholder="Example: Red zari saree prompt check" />
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
                <input value={job.brandName} onChange={(event) => onJobFieldChange('brandName', event.target.value)} placeholder="Optional brand or client name" />
              </label>
            </div>

            <PageFooter
              helper={job.garmentType === 'Saree' ? 'Saree mode is ready. Continue to intake.' : 'Detailed auto-intake is saree-first for now. Other garments still use the generic path.'}
              primaryLabel="Continue to Photo Intake"
              primaryDisabled={!completion.setup}
              onPrimary={() => goToScreen('upload')}
            />
          </section>
        ) : null}

        {screen === 'upload' ? (
          <section className="page-card">
            <div className="page-head">
              <p className="eyebrow">{stepMeta.upload.eyebrow}</p>
              <h2>{job.garmentType === 'Saree' ? 'Saree image intake and validation' : 'Reference image intake'}</h2>
              <p>{job.garmentType === 'Saree'
                ? 'The goal here is to stop guessing. Upload saree body, blouse, pallu, border, and fabric references separately so output accuracy can improve.'
                : 'Upload main product and detail views. Saree has the most detailed intake right now.'}
              </p>
            </div>

            <div className="upload-blueprint">
              {shotPlan.map((item) => {
                const coverageItem = coverage.find((entry) => entry.id === item.id)
                return (
                  <article key={item.id} className={joinClasses('blueprint-card', item.required && 'blueprint-card-required')}>
                    <div className="blueprint-card-head">
                      <strong>{item.label}</strong>
                      <span className={joinClasses('status-tag', coverageItem && coverageItem.done ? 'status-tag-ready' : '')}>
                        {coverageItem && coverageItem.done ? coverageItem.count + ' added' : item.required ? 'Required' : 'Optional'}
                      </span>
                    </div>
                    <p>{item.help}</p>
                  </article>
                )
              })}
            </div>

            <label className="upload-box">
              <input type="file" accept="image/*" multiple onChange={onPhotoUpload} />
              <strong>Add cloth photos</strong>
              <span>Upload all references here. Then confirm whether each image is saree body, blouse, pallu, border, or fabric close-up.</span>
            </label>

            <div className="detection-grid">
              <MetricCard label="Coverage Ready" value={String(coverage.filter((item) => item.done).length) + '/' + String(shotPlan.length)} helper="Confirmed shot slots filled" />
              <MetricCard label="Good Shots" value={String(qualitySummary.good)} helper="Ready to trust directly" />
              <MetricCard label="Needs Review" value={String(qualitySummary.review + qualitySummary.bad)} helper="Weak or unconfirmed images" />
              <MetricCard label="Missing Required" value={String(requiredMissing.length)} helper="Replace these before final output" />
            </div>

            <div className="photo-grid">
              {photos.length ? photos.map((photo) => (
                <article key={photo.id} className={joinClasses('photo-card', primaryPhoto && primaryPhoto.id === photo.id && 'photo-card-primary')}>
                  <img src={photo.previewUrl} alt={photo.name} />
                  <div className="photo-card-copy">
                    <strong>{photo.name}</strong>
                    <span>{photo.sizeLabel} • {photo.resolutionLabel}</span>
                  </div>

                  <div className="photo-card-meta">
                    <span className={joinClasses('quality-badge', 'quality-' + photo.quality.status)}>{photo.quality.label}</span>
                    <span>{photo.classifierHint}</span>
                  </div>

                  <label className="field photo-card-select">
                    <span>Image Type</span>
                    <select value={photo.shotType} onChange={(event) => updatePhotoShotType(photo.id, event.target.value)}>
                      <option value="unassigned">Needs Review</option>
                      {shotPlan.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                    </select>
                  </label>

                  {photo.quality.issues.length ? (
                    <ul className="photo-card-issues">
                      {photo.quality.issues.map((issue) => <li key={issue}>{issue}</li>)}
                    </ul>
                  ) : (
                    <div className="photo-card-issues photo-card-issues-clean">Shot looks usable for prompt generation.</div>
                  )}

                  <div className="photo-card-actions">
                    <button type="button" className="secondary-button" onClick={() => setPrimaryPhotoId(photo.id)}>
                      {primaryPhoto && primaryPhoto.id === photo.id ? 'Primary Photo' : 'Use As Primary'}
                    </button>
                    <button type="button" className="secondary-button" onClick={() => removePhoto(photo.id)}>
                      Remove
                    </button>
                  </div>
                </article>
              )) : (
                <div className="empty-box">
                  <strong>No photos uploaded yet</strong>
                  <span>Start with a full saree image, then add blouse, pallu, border, and fabric details.</span>
                </div>
              )}
            </div>

            {completion.upload ? (
              <section className="quick-lane">
                <div className="quick-lane-head">
                  <div>
                    <p className="eyebrow">Prompt Readiness</p>
                    <h3>Saree understanding, suggestions, and Google Flow copy</h3>
                    <p>This section shows what the system currently knows, what is missing, and whether prompt generation should be trusted.</p>
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
                      {primaryPhoto ? <img src={primaryPhoto.previewUrl} alt={primaryPhoto.name} /> : null}
                      <div className="mockup-overlay">
                        <span className="mockup-chip">{job.garmentType}</span>
                        <span className="mockup-chip">{preset.label}</span>
                        <span className="mockup-chip">{promptReady ? 'Prompt Ready' : 'Needs More Intake'}</span>
                      </div>
                    </div>
                    <div className="mockup-copy">
                      <strong>System reading</strong>
                      <div className="mockup-points">
                        <span>Saree body: {coverage.find((item) => item.id === 'saree_full')?.done ? 'Detected' : 'Missing'}</span>
                        <span>Blouse refs: {String((coverage.find((item) => item.id === 'blouse_front')?.count || 0) + (coverage.find((item) => item.id === 'blouse_back')?.count || 0))}</span>
                        <span>Pallu refs: {String(coverage.find((item) => item.id === 'pallu_detail')?.count || 0)}</span>
                        <span>Border refs: {String(coverage.find((item) => item.id === 'border_detail')?.count || 0)}</span>
                      </div>
                    </div>
                  </article>

                  <article className="guide-card">
                    <div className="guide-block">
                      <strong>Missing upload suggestions</strong>
                      <ul className="guide-list">
                        {requiredMissing.length ? requiredMissing.map((item) => <li key={item.id}>Upload {item.label.toLowerCase()} image: {item.help}</li>) : <li>Required saree slots are covered.</li>}
                      </ul>
                    </div>
                    <div className="guide-block">
                      <strong>How the real system should know</strong>
                      <ul className="guide-list">
                        {productionNotes.map((tip) => <li key={tip}>{tip}</li>)}
                      </ul>
                    </div>
                  </article>
                </div>

                <div className="prompt-stack">
                  <PromptCard
                    label="Google Flow Prompt"
                    body={prompts.googleFlow}
                    note="Paste this in Google Flow with the same image set."
                    actionLabel={copyState === 'google-flow-inline' ? 'Copied' : 'Copy'}
                    onAction={() => onCopyPrompt('google-flow-inline', prompts.googleFlow)}
                  />
                  <PromptCard
                    label="Detailed Image Prompt"
                    body={prompts.image}
                    note="This is the full prompt with saree coverage context."
                    actionLabel={copyState === 'image-prompt' ? 'Copied' : 'Copy'}
                    onAction={() => onCopyPrompt('image-prompt', prompts.image)}
                  />
                </div>
              </section>
            ) : null}

            <PageFooter
              helper={promptReady ? 'Required saree references are in place. You can continue.' : 'Prompt is not fully reliable yet. Fill missing saree slots and replace bad images.'}
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
              <p>These fields are now saree-aware. If blouse or pallu references are missing, the suggestions will stay conservative until you update them.</p>
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
              helper="These fields feed directly into the generated prompt."
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
              <p>This layer controls model pose and scene, but it should never change the saree truth collected in the intake step.</p>
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
              helper="Creative changes update both image and video prompts."
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
              <p>The final prompt should only be trusted when the intake gate is clean. Missing saree slots or bad images should stop output from being treated as final.</p>
            </div>

            <div className="summary-grid">
              <SummaryCard title="Work Setup" rows={[
                ['Job Name', buildSuggestedJobName(job)],
                ['Work Type', job.workType],
                ['Garment', job.garmentType],
                ['Audience', job.audience],
                ['Intent', job.outputIntent],
              ]} />
              <SummaryCard title="Intake Summary" rows={[
                ['Photos Added', String(photos.length)],
                ['Primary Photo', primaryPhoto ? primaryPhoto.name : 'Not selected'],
                ['Required Missing', String(requiredMissing.length)],
                ['Prompt Ready', promptReady ? 'Yes' : 'No'],
              ]} />
            </div>

            {primaryPhoto ? (
              <article className="mockup-card review-mockup-card">
                <div className="mockup-preview">
                  <img src={primaryPhoto.previewUrl} alt={primaryPhoto.name} />
                  <div className="mockup-overlay">
                    <span className="mockup-chip">{getShotTypeLabel(job.garmentType, primaryPhoto.shotType)}</span>
                    <span className="mockup-chip">{resolvedCreative.background}</span>
                    <span className="mockup-chip">{promptReady ? 'Ready' : 'Blocked'}</span>
                  </div>
                </div>
                <div className="mockup-copy">
                  <strong>Prompt trust summary</strong>
                  <div className="mockup-points">
                    <span>Reference coverage: {buildReferenceLine(photos, job.garmentType)}</span>
                    <span>Good shots: {qualitySummary.good}</span>
                    <span>Needs review: {qualitySummary.review + qualitySummary.bad}</span>
                    <span>Preset: {preset.label}</span>
                  </div>
                </div>
              </article>
            ) : null}

            <div className="prompt-stack">
              <PromptCard
                label="Google Flow Prompt"
                body={prompts.googleFlow}
                note="Fastest external test path: upload the same references in Google Flow and paste this."
                actionLabel={copyState === 'review-google' ? 'Copied' : 'Copy'}
                onAction={() => onCopyPrompt('review-google', prompts.googleFlow)}
              />
              <PromptCard
                label="Detailed Image Prompt"
                body={prompts.image}
                note="This contains the full saree coverage context."
                actionLabel={copyState === 'review-image' ? 'Copied' : 'Copy'}
                onAction={() => onCopyPrompt('review-image', prompts.image)}
              />
              {(job.workType === 'video' || job.workType === 'image-video') ? (
                <PromptCard
                  label="Video Prompt"
                  body={prompts.video}
                  note="Video prompt keeps the same saree truth while adding motion direction."
                  actionLabel={copyState === 'review-video' ? 'Copied' : 'Copy'}
                  onAction={() => onCopyPrompt('review-video', prompts.video)}
                />
              ) : null}
            </div>

            <div className="review-actions">
              <button type="button" className="primary-button" disabled={!promptReady} onClick={startOutputJobs}>
                Start Work Now
              </button>
              <button type="button" className="secondary-button" onClick={() => goToScreen('upload')}>
                Back To Intake
              </button>
            </div>

            {!promptReady ? (
              <div className="empty-box">
                <strong>Prompt is blocked</strong>
                <span>Fill all required saree slots and replace bad images before starting final work.</span>
              </div>
            ) : null}

            <div className="job-list">
              {jobs.length ? jobs.map((item) => (
                <article key={item.id} className="job-card">
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.note}</p>
                  </div>
                  <span className="status-tag">{item.kind} • {item.status}</span>
                </article>
              )) : null}
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
