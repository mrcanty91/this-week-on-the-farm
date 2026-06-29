/* Seso UI kit — screens (Login, Workers, Worker profile, Contract, Payroll). */
(function () {
  const D = window.SesoDesignSystem_373f56;
  const { Button, Badge, StatusIndicator, Tag, Input, Select, Checkbox, Avatar, Tabs, StatField, FormField, Card, DataTable } = D;
  const I = window.SesoIcons;

  const statusCell = (code) => {
    const m = {
      uploaded: <StatusIndicator tone="success" label="Uploaded" />,
      actions: <StatusIndicator tone="warning" label="Actions…" />,
      read: <StatusIndicator tone="success" label="Read" />,
      delivered: <StatusIndicator tone="pending" label="Delivered" />,
    };
    return m[code] || null;
  };

  const PAGE = { maxWidth: 1100, margin: "0 auto", padding: "28px 32px" };

  /* ---------------- LOGIN ---------------- */
  function LoginScreen({ onSignIn }) {
    return (
      <div style={{ display: "flex", height: "100%", width: "100%" }}>
        {/* Brand panel */}
        <div style={{ flex: "1 1 46%", background: "var(--brand)", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 48 }}>
          <img src="../../assets/logo-lockup.png" alt="Seso" style={{ height: 44, alignSelf: "flex-start" }} />
          <div>
            <h1 style={{ color: "#fff", fontSize: 40, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, maxWidth: 420 }}>
              Run your season with Seso
            </h1>
            <p style={{ color: "rgba(255,255,255,.82)", fontSize: 17, marginTop: 16, maxWidth: 380 }}>
              The all-in-one system for farmers to hire, manage, and retain a reliable workforce.
            </p>
          </div>
          <div style={{ color: "rgba(255,255,255,.7)", fontSize: 13 }}>© 2026 Seso, Inc.</div>
        </div>
        {/* Form */}
        <div style={{ flex: "1 1 54%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <form
            onSubmit={(e) => { e.preventDefault(); onSignIn && onSignIn(); }}
            style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 18 }}
          >
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700 }}>Sign in</h2>
              <p style={{ color: "var(--text-muted)", marginTop: 6, fontSize: 14 }}>Welcome back. Sign in to manage your season.</p>
            </div>
            <FormField label="Work email" htmlFor="email">
              <Input id="email" type="email" defaultValue="kim@acmefruits.com" prefix={<I.AtSign size={16} />} />
            </FormField>
            <FormField label="Password" htmlFor="pw">
              <Input id="pw" type="password" defaultValue="password" />
            </FormField>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Checkbox checked label="Remember me" onChange={() => {}} />
              <a href="#" style={{ fontSize: 13, fontWeight: 600 }}>Forgot password?</a>
            </div>
            <Button type="submit" variant="primary" size="lg" fullWidth>Sign in</Button>
            <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
              Are you a worker? <a href="#" style={{ fontWeight: 600 }}>Go to the worker app</a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* ---------------- WORKERS / ONBOARDING ---------------- */
  function WorkersScreen({ onOpenWorker }) {
    const data = window.SesoData.workers;
    const [sel, setSel] = React.useState([]);
    const columns = [
      {
        key: "name", header: "Name", sortable: true, wrap: true,
        render: (r) => (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <a href="#" onClick={(e) => { e.preventDefault(); onOpenWorker && onOpenWorker(); }} style={{ fontWeight: 600 }}>{r.name}</a>
            <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>{r.contract}</span>
          </div>
        ),
      },
      { key: "id", header: "ID", mono: true, sortable: true },
      { key: "hire", header: "Hire date", sortable: true },
      { key: "i9", header: "I-94", render: (r) => statusCell(r.i9) },
      { key: "visa", header: "H-2A visa", render: (r) => statusCell(r.visa) },
      { key: "link", header: "Link status", render: (r) => statusCell(r.link) },
      {
        key: "act", header: "", align: "right",
        render: () => (
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button size="sm" variant="secondary">Send link</Button>
            <Button size="sm" variant="secondary" iconRight={<I.ExternalLink size={13} />}>Open packet</Button>
          </div>
        ),
      },
    ];
    return (
      <div style={PAGE}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700 }}>Workers</h1>
            <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>Digital onboarding — {data.length} workers in progress</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ width: 220 }}><Input placeholder="Search workers" prefix={<I.Search size={16} />} /></div>
            <Button variant="primary" iconLeft={<I.Plus size={15} />}>Add worker</Button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <Tag color="green">All crews</Tag>
          <Tag color="neutral" onRemove={() => {}}>Avocado Contract</Tag>
          <Tag color="neutral" onRemove={() => {}}>Needs action</Tag>
        </div>
        <Card padded={false}>
          <DataTable columns={columns} rows={data} selectable selected={sel} onSelect={setSel} onRowClick={() => onOpenWorker && onOpenWorker()} />
        </Card>
      </div>
    );
  }

  /* ---------------- WORKER PROFILE ---------------- */
  function WorkerProfileScreen() {
    const w = window.SesoData.worker;
    const [tab, setTab] = React.useState("Profile");
    const [sub, setSub] = React.useState("Basic info & contact");
    const subnav = ["Basic info & contact", "Identification", "Employment & payroll", "Benefits & deductions", "All documents"];
    return (
      <div style={PAGE}>
        {/* Header */}
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <Avatar name={w.name} shape="rounded" size={68} src="../../assets/worker-face.png" />
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.01em", flex: 1, minWidth: 0 }}>{w.name}</h1>
          <Button variant="secondary" iconRight={<I.MoreHorizontal size={16} />}>Actions</Button>
        </div>
        <div style={{ display: "flex", gap: 40, marginTop: 18, flexWrap: "wrap" }}>
          <StatField label="Type"><Badge tone="green">{w.type}</Badge></StatField>
          <StatField label="Status"><StatusIndicator tone="success" icon={<I.Play size={15} color="var(--success)" />} label={w.status} /></StatField>
          <StatField label="ID" mono>{w.id}</StatField>
          <StatField label="Date of birth">{w.dob}</StatField>
          <StatField label="SSN" mono>{w.ssn} <a href="#" style={{ fontWeight: 600, fontFamily: "var(--font-sans)", fontSize: 13, marginLeft: 4 }}>Show</a></StatField>
          <StatField label="Crew">{w.crew}</StatField>
        </div>

        <div style={{ marginTop: 18 }}>
          <Tabs items={["Profile", "Contracts", "Employment log", "Notes"]} value={tab} onChange={setTab} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 32, marginTop: 24 }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2, borderLeft: "1px solid var(--border)" }}>
            {subnav.map((s) => {
              const active = s === sub;
              return (
                <button key={s} onClick={() => setSub(s)} style={{
                  textAlign: "left", border: "none", background: "transparent", cursor: "pointer",
                  padding: "10px 14px", marginLeft: -1, fontFamily: "var(--font-sans)", fontSize: 14,
                  fontWeight: active ? 700 : 500, color: active ? "var(--text-heading)" : "var(--text-muted)",
                  borderLeft: `2px solid ${active ? "var(--action)" : "transparent"}`,
                }}>{s}</button>
              );
            })}
          </nav>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Card title="Basic information" actions={<><Button variant="ghost">Cancel</Button><Button variant="primary">Save</Button></>}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 }}>
                <FormField label="Full name"><Input defaultValue={w.name} /></FormField>
                <FormField label="Employee ID"><Input defaultValue={w.id} /></FormField>
                <FormField label="Sex"><Input defaultValue={w.sex} /></FormField>
                <FormField label="Worker type"><Select options={["H-2A", "Domestic", "H-2B"]} defaultValue="H-2A" /></FormField>
              </div>
            </Card>
            <Card title="Date of birth" subtitle="Birth certificate" actions={<Button variant="secondary" iconLeft={<I.FileText size={15} />}>Edit</Button>}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <StatField label="Date of birth">{w.dob}</StatField>
                <StatField label="Document image(s)"><StatusIndicator tone="success" label="1 uploaded" /></StatField>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- CONTRACT ---------------- */
  function ContractScreen() {
    const c = window.SesoData.contract;
    const [tab, setTab] = React.useState("Audit file");
    const [sub, setSub] = React.useState("Summary");
    const subnav = ["Summary", "Housing", "Transportation", "Documents", "Worker information", "Reimbursements"];
    const auditCols = [
      { key: "date", header: "Date generated", sortable: true },
      { key: "by", header: "Generated by", sortable: true },
      { key: "act", header: "", align: "right", render: () => <Button size="sm" variant="ghost" iconLeft={<I.Download size={14} />}>Download</Button> },
    ];
    return (
      <div style={PAGE}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.01em" }}>{c.name}</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary">Edit details</Button>
            <Button variant="secondary" iconRight={<I.MoreHorizontal size={16} />}>More</Button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 40, marginTop: 18, flexWrap: "wrap" }}>
          <StatField label="Start date">{c.start}</StatField>
          <StatField label="End date">{c.end}</StatField>
          <StatField label="Workers" mono>{c.workers}</StatField>
          <StatField label="Case number" mono>{c.caseNumber}</StatField>
          <StatField label="USCIS petition ID" mono>{c.petitionId}</StatField>
          <StatField label="Consulate location">{c.consulate}</StatField>
        </div>

        <div style={{ marginTop: 18 }}>
          <Tabs items={["Timeline", "Audit file", "Assigned Workers", "Recruitment"]} value={tab} onChange={setTab} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 32, marginTop: 24 }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2, borderLeft: "1px solid var(--border)" }}>
            {subnav.map((s) => {
              const active = s === sub;
              return (
                <button key={s} onClick={() => setSub(s)} style={{
                  textAlign: "left", border: "none", background: "transparent", cursor: "pointer",
                  padding: "10px 14px", marginLeft: -1, fontFamily: "var(--font-sans)", fontSize: 14,
                  fontWeight: active ? 700 : 500, color: active ? "var(--text-heading)" : "var(--text-muted)",
                  borderLeft: `2px solid ${active ? "var(--action)" : "transparent"}`,
                }}>{s}</button>
              );
            })}
          </nav>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Card>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                {c.sections.map((s) => (
                  <div key={s.label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ flex: "none", marginTop: 2 }}>
                      <StatusIndicator tone={s.status} label="" />
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--text-heading)", fontSize: 16 }}>{s.label}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>
                        {s.note || `${s.done} of ${s.total} documents uploaded`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Audit files" actions={<Button variant="primary">Generate audit file</Button>} padded={false}>
              <DataTable columns={auditCols} rows={c.audits} rowKey="date" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- PAYROLL ---------------- */
  function PayrollScreen() {
    const p = window.SesoData.payroll;
    const [sel, setSel] = React.useState(p.rows.map((r) => r.id));
    const cols = [
      { key: "name", header: "Worker", sortable: true, render: (r) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ fontWeight: 600, color: "var(--text-heading)" }}>{r.name}</span>
          <span className="seso-mono" style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>{r.id}</span>
        </div>
      ) },
      { key: "method", header: "Pay method", render: (r) => <Badge tone={r.method === "Paycard" ? "blue" : "neutral"}>{r.method}</Badge> },
      { key: "hrs", header: "Hrs worked", mono: true, align: "right" },
      { key: "ot", header: "OT hrs", mono: true, align: "right" },
      { key: "gross", header: "Gross wages", mono: true, align: "right" },
    ];
    const Stat = ({ label, value, mono }) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{label}</span>
        <span className={mono ? "seso-mono" : ""} style={{ fontSize: 20, fontWeight: 700, color: "var(--text-heading)" }}>{value}</span>
      </div>
    );
    return (
      <div style={PAGE}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800 }}>{p.crew}</h1>
              <Badge tone="neutral" dot>Draft</Badge>
            </div>
            <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>Pay period {p.period} · {p.schedule}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary">Download reports</Button>
            <Button variant="primary">Preview payroll</Button>
          </div>
        </div>

        <Card style={{ marginTop: 20 }}>
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            <Stat label="Workers to be paid" value={p.workers} mono />
            <Stat label="Gross wages" value={p.gross} mono />
            <Stat label="Overtime wages" value={p.overtime} mono />
            <Stat label="Approve by" value={p.approveBy} />
            <Stat label="Payday" value={p.payday} />
          </div>
        </Card>

        <div style={{ display: "flex", gap: 10, margin: "18px 0 14px" }}>
          <Button variant="secondary" iconLeft={<I.Plus size={15} />}>Add time entries</Button>
          <Button variant="secondary">Apply compliance rules</Button>
        </div>

        <Card padded={false}>
          <DataTable columns={cols} rows={p.rows} selectable selected={sel} onSelect={setSel} />
        </Card>
      </div>
    );
  }

  Object.assign(window, { LoginScreen, WorkersScreen, WorkerProfileScreen, ContractScreen, PayrollScreen });
})();
