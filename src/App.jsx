import { useMemo, useState } from 'react'
import './index.css'

const attributeFieldDefs = [
  { key: 'category', label: 'Garment Type', placeholder: 'Kurti, saree, shirt, lehenga...' },
  { key: 'fabric', label: 'Fabric', placeholder: 'Cotton blend, georgette, satin...' },
  { key: 'palette', label: 'Palette', placeholder: 'Deep maroon with antique gold accents' },
  { key: 'pattern', label: 'Pattern / Surface', placeholder: 'Floral embroidery on front panel' },
  { key: 'silhouette', label: 'Fit / Silhouette', placeholder: 'Straight fit, flowing drape, structured shirt' },
  { key: 'neckline', label: 'Neckline / Collar', placeholder: 'Round neck, mandarin collar, V-neck' },
  { key: 'sleeves', label: 'Sleeves', placeholder: 'Three-quarter sleeves, sleeveless, full sleeves' },
  { key: 'embellishment', label: 'Trim / Embellishment', placeholder: 'Zari border, buttons, mirror work, piping' },
]

const shotPresets = [
  {
    id: 'catalog',
    label: 'Catalog Clean',
    tone: 'white set',
    description: 'White seamless background, front + side product visibility, neutral styling.',
  },
  {
    id: 'campaign',
    label: 'Campaign Hero',
    tone: 'premium studio',
    description: 'Luxury editorial lighting, deeper shadows, strong textile texture presence.',
  },
  {
    id: 'marketplace',
    label: 'Marketplace Fast',
    tone: 'high volume',
    description: 'Fast variant workflow for multiple SKUs, simple background and consistent camera framing.',
  },
  {
    id: 'reel',
    label: 'Reel Motion',
    tone: 'social motion',
    description: 'Pose-led stills and short motion clips with drape, turn and fabric movement.',
  },
]

const posePresets = [
  'Front straight pose',
  'Walking three-quarter pose',
  'Side drape detail pose',
  'Close-up textile detail pose',
  'Seated editorial pose',
]

const backgroundPresets = [
  'Luxury beige studio',
  'White ecommerce sweep',
  'Festive palace hallway',
  'Muted outdoor sandstone',
  'Soft gradient ad backdrop',
]

const motionPresets = [
  'Slow turn with fabric flow',
  'Two-step runway walk',
  'Hand-detail embroidery reveal',
  'Shoulder-to-full look reveal',
]

const initialAttributes = {
  category: 'Women\'s kurti',
  fabric: 'Cotton silk blend',
  palette: 'Deep maroon with muted gold embroidery',
  pattern: 'Dense floral embroidery concentrated on yoke and sleeve cuff',
  silhouette: 'Straight fit with clean fall',
  neckline: 'Round neck with narrow embroidered placket',
  sleeves: 'Three-quarter sleeves',
  embellishment: 'Antique gold thread embroidery and fine border piping',
}

const initialCreativeControls = {
  targetUseCase: 'Premium catalog launch',
  modelDirection: 'Indian female model, elegant posture, premium commercial styling',
  pose: posePresets[1],
  background: backgroundPresets[0],
  lighting: 'Soft key light with controlled textile texture highlights',
  camera: '85mm mid-length fashion frame',
  styling: 'Minimal jewelry, clean hair, no competing patterns',
  videoMotion: motionPresets[0],
}

const initialOutputFeed = [
  {
    id: crypto.randomUUID(),
    kind: 'analysis',
    title: 'Source cloth analysis locked',
    note: 'Structured attributes verified before generation. Confidence review still needed for fabric and embroidery density.',
    status: 'Ready',
  },
  {
    id: crypto.randomUUID(),
    kind: 'image',
    title: 'Catalog variation queue',
    note: 'Generate 4 stills with consistent garment preservation and neutral pose.',
    status: 'Pending',
  },
  {
    id: crypto.randomUUID(),
    kind: 'video',
    title: 'Motion teaser queue',
    note: 'Prepare short reel once a still image is approved.',
    status: 'Planned',
  },
]

const workflowSteps = [
  { id: 'upload', label: 'Upload', panelId: 'stage-upload' },
  { id: 'extract', label: 'Extract', panelId: 'stage-extract' },
  { id: 'creative', label: 'Edit Prompt', panelId: 'stage-creative' },
  { id: 'images', label: 'Generate Image', panelId: 'stage-prompts' },
  { id: 'video', label: 'Generate Video', panelId: 'stage-output' },
]

function buildImagePrompt(attributes, controls, preset) {
  return [
    `Create a highly realistic fashion image of a ${attributes.category} made from ${attributes.fabric}.`,
    `Preserve the exact textile identity: ${attributes.palette}, ${attributes.pattern}, ${attributes.embellishment}.`,
    `The garment should show a ${attributes.silhouette}, ${attributes.neckline}, and ${attributes.sleeves}.`,
    `Use a ${preset.label.toLowerCase()} presentation with ${controls.modelDirection}.`,
    `Pose: ${controls.pose}. Background: ${controls.background}. Lighting: ${controls.lighting}. Camera: ${controls.camera}.`,
    `Styling notes: ${controls.styling}. Keep the cloth design accurate, premium, and commercially usable.`,
  ].join(' ')
}

function buildVideoPrompt(attributes, controls, preset) {
  return [
    `Generate a short premium fashion video for a ${attributes.category} in ${attributes.fabric}.`,
    `Retain garment truth: ${attributes.palette}, ${attributes.pattern}, ${attributes.embellishment}.`,
    `Use the ${preset.label.toLowerCase()} visual direction with ${controls.modelDirection}.`,
    `Motion: ${controls.videoMotion}. Pose base: ${controls.pose}. Background: ${controls.background}.`,
    'Prioritize textile realism, drape behavior, embroidery clarity, and social-ad readiness.',
  ].join(' ')
}

function estimateConfidence(attributes) {
  const values = Object.values(attributes)
  const filled = values.filter((value) => String(value || '').trim()).length
  return Math.min(98, 66 + filled * 4)
}

function App() {
  const [attributes, setAttributes] = useState(initialAttributes)
  const [creative, setCreative] = useState(initialCreativeControls)
  const [selectedPresetId, setSelectedPresetId] = useState('campaign')
  const [sourceImage, setSourceImage] = useState(null)
  const [outputFeed, setOutputFeed] = useState(initialOutputFeed)
  const [activeStage, setActiveStage] = useState('upload')

  const selectedPreset = shotPresets.find((preset) => preset.id === selectedPresetId) || shotPresets[0]
  const confidenceScore = estimateConfidence(attributes)

  const prompts = useMemo(() => ({
    image: buildImagePrompt(attributes, creative, selectedPreset),
    video: buildVideoPrompt(attributes, creative, selectedPreset),
    negative: 'Avoid changing embroidery placement, avoid wrong garment type, avoid extra accessories covering the cloth, avoid anatomy distortion, avoid low-detail fabric texture.',
  }), [attributes, creative, selectedPreset])

  const pipelineMetrics = useMemo(() => {
    const readyAssets = outputFeed.filter((item) => item.status === 'Ready').length
    const pendingAssets = outputFeed.filter((item) => item.status === 'Pending').length
    const plannedAssets = outputFeed.filter((item) => item.status === 'Planned').length

    return {
      confidenceScore,
      readyAssets,
      pendingAssets,
      plannedAssets,
    }
  }, [confidenceScore, outputFeed])

  const stageStatus = useMemo(() => {
    const filledAttributeCount = Object.values(attributes).filter((value) => String(value || '').trim()).length
    const hasCreativeReady = Boolean(creative.modelDirection && creative.background && creative.pose)
    const hasImageQueue = outputFeed.some((item) => item.kind === 'image')
    const hasVideoQueue = outputFeed.some((item) => item.kind === 'video')

    return {
      upload: Boolean(sourceImage),
      extract: filledAttributeCount >= 6,
      creative: hasCreativeReady,
      images: hasImageQueue,
      video: hasVideoQueue,
    }
  }, [attributes, creative, outputFeed, sourceImage])

  const activeStageIndex = workflowSteps.findIndex((step) => step.id === activeStage)
  const nextStage = activeStageIndex >= 0 ? workflowSteps[activeStageIndex + 1] || null : workflowSteps[0]

  const onUploadSourceImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setSourceImage({
      fileName: file.name,
      sizeLabel: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      previewUrl,
    })
    setActiveStage('extract')
  }

  const updateAttribute = (field, value) => {
    setAttributes((prev) => ({ ...prev, [field]: value }))
  }

  const updateCreative = (field, value) => {
    setCreative((prev) => ({ ...prev, [field]: value }))
  }

  const queueOutput = (kind) => {
    const titleMap = {
      image: `${selectedPreset.label} image batch`,
      video: `${selectedPreset.label} motion batch`,
      variation: 'Pose variation batch',
    }

    const noteMap = {
      image: `Create high-accuracy stills using ${selectedPreset.label}, ${creative.pose}, and ${creative.background}.`,
      video: `Prepare a motion clip using ${creative.videoMotion} after still selection is approved.`,
      variation: `Explore additional pose control while preserving ${attributes.pattern.toLowerCase()}.`,
    }

    setOutputFeed((prev) => [
      {
        id: crypto.randomUUID(),
        kind,
        title: titleMap[kind],
        note: noteMap[kind],
        status: kind === 'variation' ? 'Planned' : 'Pending',
      },
      ...prev,
    ])

    if (kind === 'image') setActiveStage('images')
    if (kind === 'video') setActiveStage('video')
  }

  const goToStage = (stageId) => {
    setActiveStage(stageId)
    const step = workflowSteps.find((item) => item.id === stageId)
    if (!step) return
    globalThis.document?.getElementById(step.panelId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const continueFlow = (stageId) => {
    const currentIndex = workflowSteps.findIndex((step) => step.id === stageId)
    const target = workflowSteps[currentIndex + 1] || workflowSteps[currentIndex]
    if (target) goToStage(target.id)
  }

  const startWork = () => {
    if (!sourceImage) {
      goToStage('upload')
      return
    }

    if (!stageStatus.extract) {
      goToStage('extract')
      return
    }

    if (!stageStatus.creative) {
      goToStage('creative')
      return
    }

    if (!stageStatus.images) {
      goToStage('images')
      return
    }

    goToStage('video')
  }

  return (
    <div className="textile-app-shell">
      <aside className="textile-sidebar">
        <div className="sidebar-brand-block">
          <p className="eyebrow">Miraai Textile AI</p>
          <h1>Model cloth, prompts, stills and motion from one workspace.</h1>
          <p className="sidebar-copy">
            This first build is the control layer for textile AI production: source truth, creative controls, prompt output, and job planning.
          </p>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-section-label">Workflow</span>
          <div className="sidebar-chip-list">
            {workflowSteps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                className={`sidebar-chip ${activeStage === step.id ? 'active' : ''}`}
                onClick={() => goToStage(step.id)}
              >
                <span>{index + 1}. {step.label}</span>
                <small>{stageStatus[step.id] ? 'Ready' : 'Open'}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-note textile-note">
          <strong>What is live now</strong>
          <span>Upload preview, garment attribute editor, prompt composer, shot presets, pose/video controls, and job queue planning.</span>
          <button type="button" className="primary-button start-work-button" onClick={startWork}>
            Start Work
          </button>
        </div>
      </aside>

      <main className="textile-content-area">
        <section className="textile-hero-card">
          <div className="hero-copy">
            <p className="eyebrow">Build status</p>
            <h2>Start from the cloth. Lock the truth first, then generate faster with control.</h2>
            <p>
              The product logic here is deliberate: first capture garment reality, then let the operator control pose, background, styling, and motion without rewriting everything each time.
            </p>
          </div>

          <div className="hero-status-grid">
            <MetricCard label="Attribute confidence" value={`${pipelineMetrics.confidenceScore}%`} helper="Structured analysis completeness" />
            <MetricCard label="Ready assets" value={pipelineMetrics.readyAssets} helper="Locked or usable nodes" />
            <MetricCard label="Pending jobs" value={pipelineMetrics.pendingAssets} helper="Waiting for model execution" />
            <MetricCard label="Planned variants" value={pipelineMetrics.plannedAssets} helper="Pose and video ideas queued" />
          </div>

          <div className="hero-action-row">
            <button type="button" className="primary-button" onClick={startWork}>
              Start Work
            </button>
            <button type="button" className="primary-button" onClick={() => goToStage(activeStage)}>
              Open current step
            </button>
            {nextStage ? (
              <button type="button" className="secondary-button" onClick={() => goToStage(nextStage.id)}>
                Continue to {nextStage.label}
              </button>
            ) : null}
          </div>
        </section>

        <section className="textile-grid textile-grid-source">
          <Panel
            id="stage-upload"
            title="1. Source Cloth Input"
            description="Upload the original garment or textile photo that all generation should respect."
            isActive={activeStage === 'upload'}
            footer={(
              <PanelFooter
                status={stageStatus.upload ? 'Source image selected' : 'Waiting for source image'}
                actionLabel="Continue to extract"
                onAction={() => continueFlow('upload')}
              />
            )}
          >
            <div className="source-uploader">
              <label className="upload-dropzone">
                <input type="file" accept="image/*" onChange={onUploadSourceImage} />
                <span className="dropzone-label">Upload cloth image</span>
                <span className="dropzone-copy">Use flat lay, mannequin, or on-body reference. Multi-angle support comes next.</span>
              </label>

              <div className="source-preview-card">
                {sourceImage ? (
                  <>
                    <img className="source-preview-image" src={sourceImage.previewUrl} alt="Uploaded cloth preview" />
                    <div className="source-preview-meta">
                      <strong>{sourceImage.fileName}</strong>
                      <span>{sourceImage.sizeLabel}</span>
                    </div>
                  </>
                ) : (
                  <div className="source-preview-empty">
                    <strong>No image uploaded yet</strong>
                    <span>Use the upload above to preview the source textile.</span>
                  </div>
                )}
              </div>
            </div>
          </Panel>

          <Panel
            id="stage-extract"
            title="2. Extracted Garment Truth"
            description="These fields should stay editable because AI vision will never be fully reliable by itself."
            isActive={activeStage === 'extract'}
            footer={(
              <PanelFooter
                status={stageStatus.extract ? 'Garment truth is ready to drive prompts' : 'Fill or correct the garment details'}
                actionLabel="Continue to prompt editing"
                onAction={() => continueFlow('extract')}
              />
            )}
          >
            <div className="form-grid">
              {attributeFieldDefs.map((field) => (
                <label key={field.key} className={`field ${field.key === 'pattern' || field.key === 'embellishment' ? 'full' : ''}`}>
                  <span>{field.label}</span>
                  <input
                    value={attributes[field.key]}
                    onChange={(event) => updateAttribute(field.key, event.target.value)}
                    placeholder={field.placeholder}
                  />
                </label>
              ))}
            </div>
          </Panel>
        </section>

        <section className="textile-grid textile-grid-creative">
          <Panel
            id="stage-creative"
            title="3. Shot Presets"
            description="Keep preset logic reusable so developers can later bind each preset to specific prompts and model settings."
            isActive={activeStage === 'creative'}
          >
            <div className="preset-grid">
              {shotPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`preset-card ${selectedPreset.id === preset.id ? 'active' : ''}`}
                  onClick={() => setSelectedPresetId(preset.id)}
                >
                  <div>
                    <strong>{preset.label}</strong>
                    <span>{preset.tone}</span>
                  </div>
                  <p>{preset.description}</p>
                </button>
              ))}
            </div>
          </Panel>

          <Panel
            title="4. Creative Controls"
            description="This is where the operator changes pose, model direction, scene, lighting and motion without touching base garment truth."
            isActive={activeStage === 'creative'}
            footer={(
              <PanelFooter
                status={stageStatus.creative ? 'Creative setup locked for prompt generation' : 'Choose pose, background, and direction'}
                actionLabel="Continue to prompt output"
                onAction={() => continueFlow('creative')}
              />
            )}
          >
            <div className="form-grid">
              <label className="field full">
                <span>Target Use Case</span>
                <input value={creative.targetUseCase} onChange={(event) => updateCreative('targetUseCase', event.target.value)} />
              </label>
              <label className="field full">
                <span>Model Direction</span>
                <textarea rows="3" value={creative.modelDirection} onChange={(event) => updateCreative('modelDirection', event.target.value)} />
              </label>
              <label className="field">
                <span>Pose</span>
                <select value={creative.pose} onChange={(event) => updateCreative('pose', event.target.value)}>
                  {posePresets.map((pose) => <option key={pose} value={pose}>{pose}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Background</span>
                <select value={creative.background} onChange={(event) => updateCreative('background', event.target.value)}>
                  {backgroundPresets.map((background) => <option key={background} value={background}>{background}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Lighting</span>
                <input value={creative.lighting} onChange={(event) => updateCreative('lighting', event.target.value)} />
              </label>
              <label className="field">
                <span>Camera</span>
                <input value={creative.camera} onChange={(event) => updateCreative('camera', event.target.value)} />
              </label>
              <label className="field full">
                <span>Styling Rules</span>
                <textarea rows="3" value={creative.styling} onChange={(event) => updateCreative('styling', event.target.value)} />
              </label>
              <label className="field full">
                <span>Video Motion</span>
                <select value={creative.videoMotion} onChange={(event) => updateCreative('videoMotion', event.target.value)}>
                  {motionPresets.map((motion) => <option key={motion} value={motion}>{motion}</option>)}
                </select>
              </label>
            </div>
          </Panel>
        </section>

        <section className="textile-grid textile-grid-prompts">
          <Panel
            id="stage-prompts"
            title="5. Auto Prompt Builder"
            description="This is the developer handoff format: structured inputs converted into image, video, and negative prompts."
            isActive={activeStage === 'images'}
            footer={(
              <PanelFooter
                status="You can now queue still generation from this prompt state"
                actionLabel="Continue to output queue"
                onAction={() => continueFlow('images')}
              />
            )}
          >
            <div className="prompt-stack">
              <PromptCard label="Image Prompt" body={prompts.image} />
              <PromptCard label="Video Prompt" body={prompts.video} />
              <PromptCard label="Negative Prompt" body={prompts.negative} />
            </div>
          </Panel>

          <Panel
            id="stage-output"
            title="6. Output Queue"
            description="These are staged jobs. Next step is wiring each action to actual backend generation APIs."
            isActive={activeStage === 'video'}
            footer={(
              <PanelFooter
                status={stageStatus.video ? 'Video flow has started from this point' : 'Queue image or video work to start execution flow'}
                actionLabel="Jump back to upload"
                onAction={() => goToStage('upload')}
              />
            )}
          >
            <div className="queue-action-row">
              <button type="button" className="primary-button" onClick={() => queueOutput('image')}>Queue image batch</button>
              <button type="button" className="secondary-button" onClick={() => queueOutput('video')}>Queue video batch</button>
              <button type="button" className="secondary-button" onClick={() => queueOutput('variation')}>Add pose variation</button>
            </div>

            <div className="queue-list">
              {outputFeed.map((item) => (
                <article key={item.id} className="queue-card">
                  <div className="queue-card-head">
                    <strong>{item.title}</strong>
                    <span className={`status-pill status-${item.status.toLowerCase()}`}>{item.status}</span>
                  </div>
                  <p>{item.note}</p>
                  <span className="queue-kind-label">{item.kind}</span>
                </article>
              ))}
            </div>
          </Panel>
        </section>
      </main>
    </div>
  )
}

function Panel({ id, title, description, children, footer, isActive = false }) {
  return (
    <section id={id} className={`textile-panel ${isActive ? 'panel-active' : ''}`}>
      <div className="panel-head panel-head-stack">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      {children}
      {footer}
    </section>
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

function PromptCard({ label, body }) {
  return (
    <article className="prompt-card">
      <span>{label}</span>
      <p>{body}</p>
    </article>
  )
}

function PanelFooter({ status, actionLabel, onAction }) {
  return (
    <div className="panel-footer">
      <span>{status}</span>
      <button type="button" className="secondary-button" onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  )
}

export default App
