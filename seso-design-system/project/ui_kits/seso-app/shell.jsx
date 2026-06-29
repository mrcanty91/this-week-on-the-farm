/* Seso UI kit — AppShell: sidebar + top bar layout. */
(function () {
  const { Sidebar, TopBar, Breadcrumb } = window.SesoDesignSystem_373f56;
  const I = window.SesoIcons;

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: React.createElement(I.LayoutDashboard) },
    { id: "workers", label: "Workers", icon: React.createElement(I.Users) },
    { id: "onboarding", label: "Onboarding", icon: React.createElement(I.FileText) },
    { id: "contracts", label: "Contracts", icon: React.createElement(I.Briefcase) },
    { id: "payroll", label: "Payroll", icon: React.createElement(I.DollarSign) },
    { id: "paycards", label: "Paycards", icon: React.createElement(I.CreditCard) },
  ];
  const FOOTER = [
    { id: "settings", label: "Settings", icon: React.createElement(I.Settings) },
  ];

  function AppShell({ nav, onNav, breadcrumb, children }) {
    return (
      <div style={{ display: "flex", height: "100%", width: "100%", background: "var(--surface-sunken)" }}>
        <Sidebar
          logoSrc="../../assets/logomark-white.png"
          company={window.SesoData.company}
          items={NAV}
          footerItems={FOOTER}
          active={nav}
          onSelect={onNav}
        />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          <TopBar
            left={<Breadcrumb items={breadcrumb} />}
            right={
              <>
                <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                  <I.AtSign size={16} /> Contact
                </a>
                <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                  <I.LogOut size={16} /> Sign out
                </a>
              </>
            }
          />
          <main style={{ flex: 1, overflow: "auto" }}>{children}</main>
        </div>
      </div>
    );
  }

  Object.assign(window, { AppShell, SESO_NAV: NAV });
})();
