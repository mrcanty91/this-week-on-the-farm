The dark app navigation rail — brand header, primary nav, optional pinned footer nav.

```jsx
<Sidebar
  logoSrc="assets/logomark-white.png"
  company="Acme Fruits, Inc."
  items={[{id:"workers", label:"Workers", icon:<Users/>}, ...]}
  active="workers"
  onSelect={setNav}
/>
```

Pass 20×20 icon nodes (Lucide). `footerItems` pin to the bottom. Composes `SidebarItem`.
