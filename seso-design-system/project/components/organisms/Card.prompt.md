White surface container — the default panel for grouped content. Optional header with title, subtitle, and an action cluster.

```jsx
<Card title="Basic information" actions={<Button>Save</Button>}>
  …fields…
</Card>
<Card padded={false}><DataTable …/></Card>
```

Set `padded={false}` when embedding edge-to-edge content like a table.
