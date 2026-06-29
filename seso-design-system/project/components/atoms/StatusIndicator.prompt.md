Icon + label status used inside tables and detail rows (document/compliance states).

```jsx
<StatusIndicator tone="success" label="Uploaded" />
<StatusIndicator tone="warning" label="Actions…" />
<StatusIndicator tone="pending" label="Delivered" />
```

Tones: `success` (filled green check), `warning` (amber alert), `pending` (hollow gray check), `info`, `danger`. Pass `icon` to override the glyph.
