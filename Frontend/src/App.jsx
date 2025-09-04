import { useEffect, useMemo, useState } from 'react';

async function fetchProducts({ limit, sort, dir, name, sku, cursor }) {
  const params = new URLSearchParams();
  params.set('limit', String(limit ?? 20));
  if (sort) params.set('sort', sort);
  if (dir) params.set('dir', dir);
  if (name) params.set('name', name);
  if (sku) params.set('sku', sku);
  if (cursor) params.set('cursor', cursor);

  const res = await fetch(`/api/products?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // { items, nextCursor }
}

export default function App() {
  const [limit] = useState(20);
  const [sort, setSort] = useState('created_at');
  const [dir, setDir] = useState('desc');
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [cursor, setCursor] = useState('');
  const [data, setData] = useState({ items: [], nextCursor: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset to first page when filters/sort change
  useEffect(() => {
    setCursor('');
  }, [sort, dir, name, sku]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchProducts({ limit, sort, dir, name, sku, cursor })
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(String(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [limit, sort, dir, name, sku, cursor]);

  const hasNext = useMemo(() => Boolean(data?.nextCursor), [data]);

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Products</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Search name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Search SKU..."
          value={sku}
          onChange={(e) => setSku(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="created_at">Created At</option>
          <option value="updated_at">Updated At</option>
          <option value="name">Name</option>
        </select>
        <select value={dir} onChange={(e) => setDir(e.target.value)}>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
        <button onClick={() => setCursor('')}>Apply</button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {!loading && !error && (data?.items?.length ? (
        <>
          <table border="1" cellPadding="6" cellSpacing="0" width="100%">
            <thead>
              <tr>
                <th>ID</th>
                <th>SKU</th>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Created</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.sku}</td>
                  <td>{p.name}</td>
                  <td>{p.description}</td>
                  <td>{p.price}</td>
                  <td>{new Date(p.createdAt).toLocaleString()}</td>
                  <td>{new Date(p.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 12 }}>
            <button onClick={() => setCursor(data.nextCursor || '')} disabled={!hasNext}>
              Next →
            </button>
          </div>
        </>
      ) : (
        <p>No products found.</p>
      ))}
    </div>
  );
}
