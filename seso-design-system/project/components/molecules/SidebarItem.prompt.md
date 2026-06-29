A nav row for the dark Sidebar; active row gets the lighter navy fill.

```jsx
<SidebarItem icon={<Users/>} label="Workers" active onClick={go} />
```

Usually rendered by `Sidebar`, not directly. Set `collapsed` for an icon-only rail.
