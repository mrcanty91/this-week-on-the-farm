The list view that powers Workers, Payroll, and audit tables. Light header, hairline rows, optional selection.

```jsx
<DataTable
  columns={[{key:"name", header:"Name", render:r=><a>{r.name}</a>}, {key:"id", header:"ID", mono:true, sortable:true}]}
  rows={workers}
  selectable selected={sel} onSelect={setSel}
  onRowClick={openWorker}
/>
```

Each column declares `render(row)` for rich cells, `mono` for IDs/currency, `align`, `sortable`. Use `StatusIndicator` inside cells for document states.
