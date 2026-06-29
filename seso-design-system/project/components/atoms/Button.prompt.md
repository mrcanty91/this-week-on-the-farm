Buttons trigger actions; the action-blue `primary` is the single most-emphasized control in any Seso view.

```jsx
<Button variant="primary" onClick={save}>Save</Button>
<Button variant="secondary" iconRight={<ExternalIcon />}>Open packet</Button>
<Button variant="ghost">Cancel</Button>
```

Variants: `primary` (blue fill — main action), `secondary` (white + hairline border — row/secondary actions like "Send link"), `ghost` (text-only — "Cancel"), `brand` (green fill — marketing CTAs), `danger`. Sizes: `sm` / `md` / `lg`. Pass `iconLeft` / `iconRight` as nodes; use one primary action per view.
