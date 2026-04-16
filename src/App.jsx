import { useEffect, useMemo, useState } from 'react'
import './index.css'

const initialClients = [
  {
    id: crypto.randomUUID(),
    name: 'Shree Fashion Studio',
    company: 'Shree Fashion Studio',
    phone: '+91 98765 43210',
    email: 'hello@shreefashion.com',
    address: 'Surat',
  },
]

const initialStaff = [
  {
    id: crypto.randomUUID(),
    name: 'Ravi',
    role: 'Editor',
    phone: '+91 99999 11111',
  },
]

const initialWorks = [
  {
    id: crypto.randomUUID(),
    title: 'Summer Saree Catalogue',
    catalogueName: 'SS-2026',
    clientId: initialClients[0].id,
    staffId: initialStaff[0].id,
    startDate: '2026-04-16',
    deadline: '2026-04-20',
    status: 'In Progress',
    paymentStatus: 'Pending',
    priority: 'High',
    attachments: ['reference-board.pdf'],
  },
]

const initialInvoices = [
  {
    id: crypto.randomUUID(),
    invoiceNo: 'INV-001',
    clientId: initialClients[0].id,
    workId: initialWorks[0].id,
    amount: '18000',
    issueDate: '2026-04-16',
    dueDate: '2026-04-22',
    status: 'Pending',
  },
]

const navItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'clients', label: 'Clients' },
  { key: 'staff', label: 'Staff' },
  { key: 'works', label: 'Works' },
  { key: 'payments', label: 'Payments' },
]

function usePersistedState(key, fallback) {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])

  return [state, setState]
}

function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [clients, setClients] = usePersistedState('cw-clients', initialClients)
  const [staff, setStaff] = usePersistedState('cw-staff', initialStaff)
  const [works, setWorks] = usePersistedState('cw-works', initialWorks)
  const [invoices, setInvoices] = usePersistedState('cw-invoices', initialInvoices)

  const metrics = useMemo(() => {
    const pendingWorks = works.filter((work) => work.status !== 'Completed').length
    const completedWorks = works.filter((work) => work.status === 'Completed').length
    const pendingPayments = invoices.filter((invoice) => invoice.status !== 'Paid').length
    const totalRevenue = invoices.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0)

    return {
      totalClients: clients.length,
      totalStaff: staff.length,
      pendingWorks,
      completedWorks,
      pendingPayments,
      totalRevenue,
    }
  }, [clients, staff, works, invoices])

  const clientMap = useMemo(() => Object.fromEntries(clients.map((item) => [item.id, item])), [clients])
  const staffMap = useMemo(() => Object.fromEntries(staff.map((item) => [item.id, item])), [staff])
  const workMap = useMemo(() => Object.fromEntries(works.map((item) => [item.id, item])), [works])

  const addClient = (payload) => {
    setClients((prev) => [{ id: crypto.randomUUID(), ...payload }, ...prev])
    setActiveView('clients')
  }

  const addStaff = (payload) => {
    setStaff((prev) => [{ id: crypto.randomUUID(), ...payload }, ...prev])
    setActiveView('staff')
  }

  const addWork = (payload) => {
    const workId = crypto.randomUUID()
    setWorks((prev) => [{ id: workId, ...payload }, ...prev])

    if (payload.invoiceAmount) {
      setInvoices((prev) => [
        {
          id: crypto.randomUUID(),
          invoiceNo: `INV-${String(prev.length + 1).padStart(3, '0')}`,
          clientId: payload.clientId,
          workId,
          amount: payload.invoiceAmount,
          issueDate: payload.startDate,
          dueDate: payload.deadline,
          status: payload.paymentStatus || 'Pending',
        },
        ...prev,
      ])
    }

    setActiveView('works')
  }

  const addInvoice = (payload) => {
    setInvoices((prev) => [{ id: crypto.randomUUID(), ...payload }, ...prev])
    setActiveView('payments')
  }

  const updateInvoiceStatus = (invoiceId, status) => {
    setInvoices((prev) => prev.map((invoice) => (invoice.id === invoiceId ? { ...invoice, status } : invoice)))
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Desktop Operations</p>
          <h1>Client Workdesk</h1>
          <p className="sidebar-copy">
            Client details, staff work, catalogue tracking, invoices and attachments, all in one place.
          </p>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`nav-button ${activeView === item.key ? 'active' : ''}`}
              onClick={() => setActiveView(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-note">
          <strong>Flow</strong>
          <span>Add client → add staff → create work → track payment.</span>
        </div>
      </aside>

      <main className="content-area">
        <header className="hero-card">
          <div>
            <p className="eyebrow">Overview</p>
            <h2>Manage staff work and client details without losing track</h2>
            <p>
              This starter app is focused on work management, not image generation. It tracks who the client is,
              which catalogue is being handled, which staff member is assigned, and what payment is pending.
            </p>
          </div>
        </header>

        {activeView === 'dashboard' && (
          <section className="stack-lg">
            <div className="stats-grid">
              <StatCard label="Clients" value={metrics.totalClients} helper="Stored client records" />
              <StatCard label="Staff" value={metrics.totalStaff} helper="Available team members" />
              <StatCard label="Pending Work" value={metrics.pendingWorks} helper="Still in process" />
              <StatCard label="Pending Payments" value={metrics.pendingPayments} helper="Need follow-up" />
            </div>

            <div className="grid-two">
              <Panel title="Recent Work">
                <div className="list-stack">
                  {works.map((work) => (
                    <article key={work.id} className="list-card">
                      <div>
                        <strong>{work.title}</strong>
                        <p>
                          {work.catalogueName} • {clientMap[work.clientId]?.name || 'No client'}
                        </p>
                      </div>
                      <div className="meta-block">
                        <Badge tone={work.status === 'Completed' ? 'success' : 'neutral'}>{work.status}</Badge>
                        <span>{staffMap[work.staffId]?.name || 'Unassigned'}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </Panel>

              <Panel title="Payment Summary">
                <div className="summary-box">
                  <div>
                    <span>Total invoice value</span>
                    <strong>₹{metrics.totalRevenue.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span>Completed work</span>
                    <strong>{metrics.completedWorks}</strong>
                  </div>
                </div>
                <div className="list-stack compact">
                  {invoices.map((invoice) => (
                    <article key={invoice.id} className="list-card compact">
                      <div>
                        <strong>{invoice.invoiceNo}</strong>
                        <p>{clientMap[invoice.clientId]?.name || 'No client'}</p>
                      </div>
                      <div className="meta-block">
                        <Badge tone={invoice.status === 'Paid' ? 'success' : 'warning'}>{invoice.status}</Badge>
                        <span>₹{Number(invoice.amount || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </Panel>
            </div>
          </section>
        )}

        {activeView === 'clients' && (
          <section className="grid-two">
            <Panel title="Add Client">
              <ClientForm onSubmit={addClient} />
            </Panel>
            <Panel title="Client Records">
              <div className="list-stack">
                {clients.map((client) => {
                  const relatedCatalogues = works
                    .filter((work) => work.clientId === client.id)
                    .map((work) => work.catalogueName)
                    .filter(Boolean)
                  const uniqueCatalogues = [...new Set(relatedCatalogues)]

                  return (
                    <article key={client.id} className="list-card stretch">
                      <div>
                        <strong>{client.name}</strong>
                        <p>{client.company || 'No company'}</p>
                        <small>{client.phone || 'No phone'} • {client.email || 'No email'}</small>
                      </div>
                      <div className="catalogue-pill-wrap">
                        {uniqueCatalogues.length ? (
                          uniqueCatalogues.map((catalogue) => <span key={catalogue} className="pill">{catalogue}</span>)
                        ) : (
                          <span className="muted">No catalogue yet</span>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            </Panel>
          </section>
        )}

        {activeView === 'staff' && (
          <section className="grid-two">
            <Panel title="Add Staff">
              <StaffForm onSubmit={addStaff} />
            </Panel>
            <Panel title="Staff Members">
              <div className="list-stack">
                {staff.map((person) => {
                  const activeAssignments = works.filter((work) => work.staffId === person.id && work.status !== 'Completed').length
                  return (
                    <article key={person.id} className="list-card stretch">
                      <div>
                        <strong>{person.name}</strong>
                        <p>{person.role}</p>
                        <small>{person.phone || 'No phone'}</small>
                      </div>
                      <div className="meta-block align-end">
                        <Badge tone={activeAssignments > 0 ? 'warning' : 'success'}>
                          {activeAssignments} active work
                        </Badge>
                      </div>
                    </article>
                  )
                })}
              </div>
            </Panel>
          </section>
        )}

        {activeView === 'works' && (
          <section className="grid-two">
            <Panel title="Create Work Entry">
              <WorkForm clients={clients} staff={staff} onSubmit={addWork} />
            </Panel>
            <Panel title="Work Tracker">
              <div className="list-stack">
                {works.map((work) => (
                  <article key={work.id} className="work-card">
                    <div className="work-card-top">
                      <div>
                        <strong>{work.title}</strong>
                        <p>{work.catalogueName}</p>
                      </div>
                      <div className="meta-block align-end">
                        <Badge tone={work.status === 'Completed' ? 'success' : 'neutral'}>{work.status}</Badge>
                        <Badge tone={work.paymentStatus === 'Paid' ? 'success' : 'warning'}>{work.paymentStatus}</Badge>
                      </div>
                    </div>

                    <div className="detail-grid">
                      <Detail label="Client" value={clientMap[work.clientId]?.name || 'Not selected'} />
                      <Detail label="Assigned Staff" value={staffMap[work.staffId]?.name || 'Not selected'} />
                      <Detail label="Start" value={work.startDate || '-'} />
                      <Detail label="Deadline" value={work.deadline || '-'} />
                      <Detail label="Priority" value={work.priority || '-'} />
                    </div>

                    {work.attachments?.length > 0 && (
                      <div className="attachment-wrap">
                        {work.attachments.map((file) => (
                          <span key={file} className="pill pill-file">{file}</span>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </Panel>
          </section>
        )}

        {activeView === 'payments' && (
          <section className="grid-two">
            <Panel title="Add Invoice">
              <InvoiceForm clients={clients} works={works} onSubmit={addInvoice} />
            </Panel>
            <Panel title="Invoice Tracker">
              <div className="list-stack">
                {invoices.map((invoice) => (
                  <article key={invoice.id} className="list-card stretch">
                    <div>
                      <strong>{invoice.invoiceNo}</strong>
                      <p>{clientMap[invoice.clientId]?.name || 'No client'}</p>
                      <small>{workMap[invoice.workId]?.title || 'Manual invoice entry'}</small>
                    </div>
                    <div className="meta-block align-end">
                      <strong>₹{Number(invoice.amount || 0).toLocaleString('en-IN')}</strong>
                      <select
                        className="status-select"
                        value={invoice.status}
                        onChange={(event) => updateInvoiceStatus(invoice.id, event.target.value)}
                      >
                        <option>Pending</option>
                        <option>Part Paid</option>
                        <option>Paid</option>
                      </select>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>
          </section>
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value, helper }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{helper}</small>
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h3>{title}</h3>
      </div>
      {children}
    </section>
  )
}

function Detail({ label, value }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

function ClientForm({ onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    address: '',
  })

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.name.trim()) return
    onSubmit(form)
    setForm({ name: '', company: '', phone: '', email: '', address: '' })
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <Input label="Client name" name="name" value={form.name} onChange={handleChange} required />
      <Input label="Company" name="company" value={form.company} onChange={handleChange} />
      <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
      <Input label="Email" name="email" value={form.email} onChange={handleChange} />
      <Input label="Address" name="address" value={form.address} onChange={handleChange} className="full" />
      <button className="primary-button full">Save Client</button>
    </form>
  )
}

function StaffForm({ onSubmit }) {
  const [form, setForm] = useState({ name: '', role: '', phone: '' })

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.name.trim()) return
    onSubmit(form)
    setForm({ name: '', role: '', phone: '' })
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <Input label="Staff name" name="name" value={form.name} onChange={handleChange} required />
      <Input label="Role" name="role" value={form.role} onChange={handleChange} />
      <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
      <button className="primary-button full">Save Staff</button>
    </form>
  )
}

function WorkForm({ clients, staff, onSubmit }) {
  const [attachments, setAttachments] = useState([])
  const [form, setForm] = useState({
    title: '',
    catalogueName: '',
    clientId: clients[0]?.id || '',
    staffId: staff[0]?.id || '',
    startDate: today(),
    deadline: '',
    status: 'In Progress',
    paymentStatus: 'Pending',
    priority: 'Medium',
    invoiceAmount: '',
  })

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handlePickFiles = async () => {
    const files = await window.desktopAPI?.pickFiles?.()
    if (files?.length) {
      setAttachments(files)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.title.trim() || !form.clientId || !form.staffId) return
    onSubmit({ ...form, attachments })
    setAttachments([])
    setForm({
      title: '',
      catalogueName: '',
      clientId: clients[0]?.id || '',
      staffId: staff[0]?.id || '',
      startDate: today(),
      deadline: '',
      status: 'In Progress',
      paymentStatus: 'Pending',
      priority: 'Medium',
      invoiceAmount: '',
    })
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <Input label="Work title" name="title" value={form.title} onChange={handleChange} required />
      <Input label="Catalogue name" name="catalogueName" value={form.catalogueName} onChange={handleChange} />
      <Select label="Client" name="clientId" value={form.clientId} onChange={handleChange} options={clients.map((item) => ({ value: item.id, label: item.name }))} />
      <Select label="Assigned staff" name="staffId" value={form.staffId} onChange={handleChange} options={staff.map((item) => ({ value: item.id, label: item.name }))} />
      <Input label="Start date" type="date" name="startDate" value={form.startDate} onChange={handleChange} />
      <Input label="Deadline" type="date" name="deadline" value={form.deadline} onChange={handleChange} />
      <Select label="Status" name="status" value={form.status} onChange={handleChange} options={[
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Ready for Review', label: 'Ready for Review' },
        { value: 'Completed', label: 'Completed' },
      ]} />
      <Select label="Priority" name="priority" value={form.priority} onChange={handleChange} options={[
        { value: 'Low', label: 'Low' },
        { value: 'Medium', label: 'Medium' },
        { value: 'High', label: 'High' },
      ]} />
      <Select label="Payment status" name="paymentStatus" value={form.paymentStatus} onChange={handleChange} options={[
        { value: 'Pending', label: 'Pending' },
        { value: 'Part Paid', label: 'Part Paid' },
        { value: 'Paid', label: 'Paid' },
      ]} />
      <Input label="Invoice amount" name="invoiceAmount" value={form.invoiceAmount} onChange={handleChange} placeholder="e.g. 25000" />

      <div className="full attachment-box">
        <div>
          <label>Attachments</label>
          <p>Reference images, PDFs, ZIPs or client files.</p>
        </div>
        <button type="button" className="secondary-button" onClick={handlePickFiles}>
          Pick files
        </button>
      </div>

      {attachments.length > 0 && (
        <div className="full attachment-wrap">
          {attachments.map((file) => (
            <span key={file} className="pill pill-file">{file.split('/').pop()}</span>
          ))}
        </div>
      )}

      <button className="primary-button full">Save Work Entry</button>
    </form>
  )
}

function InvoiceForm({ clients, works, onSubmit }) {
  const [form, setForm] = useState({
    invoiceNo: `INV-${String(works.length + 1).padStart(3, '0')}`,
    clientId: clients[0]?.id || '',
    workId: works[0]?.id || '',
    amount: '',
    issueDate: today(),
    dueDate: '',
    status: 'Pending',
  })

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      clientId: prev.clientId || clients[0]?.id || '',
      workId: prev.workId || works[0]?.id || '',
    }))
  }, [clients, works])

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.invoiceNo.trim() || !form.clientId) return
    onSubmit(form)
    setForm({
      invoiceNo: `INV-${String(Date.now()).slice(-3)}`,
      clientId: clients[0]?.id || '',
      workId: works[0]?.id || '',
      amount: '',
      issueDate: today(),
      dueDate: '',
      status: 'Pending',
    })
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <Input label="Invoice no" name="invoiceNo" value={form.invoiceNo} onChange={handleChange} />
      <Select label="Client" name="clientId" value={form.clientId} onChange={handleChange} options={clients.map((item) => ({ value: item.id, label: item.name }))} />
      <Select label="Related work" name="workId" value={form.workId} onChange={handleChange} options={[
        { value: '', label: 'Manual invoice entry' },
        ...works.map((item) => ({ value: item.id, label: item.title })),
      ]} />
      <Input label="Amount" name="amount" value={form.amount} onChange={handleChange} />
      <Input label="Issue date" type="date" name="issueDate" value={form.issueDate} onChange={handleChange} />
      <Input label="Due date" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
      <Select label="Status" name="status" value={form.status} onChange={handleChange} options={[
        { value: 'Pending', label: 'Pending' },
        { value: 'Part Paid', label: 'Part Paid' },
        { value: 'Paid', label: 'Paid' },
      ]} />
      <button className="primary-button full">Save Invoice</button>
    </form>
  )
}

function Input({ label, className = '', ...props }) {
  return (
    <label className={`field ${className}`.trim()}>
      <span>{label}</span>
      <input {...props} />
    </label>
  )
}

function Textarea({ label, className = '', ...props }) {
  return (
    <label className={`field ${className}`.trim()}>
      <span>{label}</span>
      <textarea rows="4" {...props} />
    </label>
  )
}

function Select({ label, options, className = '', ...props }) {
  return (
    <label className={`field ${className}`.trim()}>
      <span>{label}</span>
      <select {...props}>
        {options.map((option) => (
          <option key={`${option.value}-${option.label}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default App
