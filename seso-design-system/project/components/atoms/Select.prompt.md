Native dropdown styled to match Input, with a chevron.

```jsx
<Select options={["H-2A","Domestic","H-2B"]} value={t} onChange={e=>set(e.target.value)} />
```

Accepts `options` (strings or `{value,label}`) or `<option>` children.
