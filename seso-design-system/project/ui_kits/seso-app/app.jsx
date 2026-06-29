/* Seso UI kit — interactive orchestrator. */
(function () {
  const { AppShell, LoginScreen, WorkersScreen, WorkerProfileScreen, ContractScreen, PayrollScreen } = window;
  const { Card, Button } = window.SesoDesignSystem_373f56;

  function Placeholder({ title }) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>{title}</h1>
        <Card>
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
            This view is part of the Seso platform — not recreated in this UI kit.
          </div>
        </Card>
      </div>
    );
  }

  function App() {
    const [authed, setAuthed] = React.useState(false);
    const [nav, setNav] = React.useState("onboarding");
    const [view, setView] = React.useState(null); // 'worker' overlays the workers nav

    if (!authed) return <LoginScreen onSignIn={() => setAuthed(true)} />;

    const go = (id) => { setNav(id); setView(null); };

    let content, breadcrumb;
    if (view === "worker") {
      content = <WorkerProfileScreen />;
      breadcrumb = [{ label: "Workers", href: "#" }, "Jose Hernandez"];
    } else if (nav === "workers" || nav === "onboarding") {
      content = <WorkersScreen onOpenWorker={() => setView("worker")} />;
      breadcrumb = [nav === "onboarding" ? "Onboarding" : "Workers"];
    } else if (nav === "contracts") {
      content = <ContractScreen />;
      breadcrumb = [{ label: "Contracts", href: "#" }, { label: "Avocado Harvest", href: "#" }, "Assigned Workers"];
    } else if (nav === "payroll") {
      content = <PayrollScreen />;
      breadcrumb = [{ label: "Payroll", href: "#" }, { label: "Drafts", href: "#" }, "Avocado Crew"];
    } else {
      const titles = { dashboard: "Dashboard", paycards: "Paycards", settings: "Settings" };
      content = <Placeholder title={titles[nav] || "Seso"} />;
      breadcrumb = [titles[nav] || "Seso"];
    }

    // breadcrumb back-nav: clicking the first "Workers" crumb returns to list
    const bc = breadcrumb.map((c) =>
      typeof c === "object" && c.label === "Workers" ? { label: "Workers", href: "#", onClick: () => setView(null) } : c
    );

    return (
      <AppShell nav={view === "worker" ? "workers" : nav} onNav={go} breadcrumb={breadcrumb}>
        {content}
      </AppShell>
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
})();
