import { useEffect, useMemo, useState } from "react";

function buildQuery(params) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      sp.set(k, String(v));
    }
  });
  return sp.toString();
}

async function fetchProducts({ pageNo, pageSize, sortBy, sortDir, name, sku }) {
  const qs = buildQuery({ pageNo, pageSize, sortBy, sortDir, name, sku });
  const res = await fetch(`/api/products?${qs}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // Expecting Spring Page<Product>
}

function useDebounced(value, delayMs = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

// --- App --------------------------------------------------------------------
export default function App() {
  // server params (Spring controller expects 1-based pageNo)
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  // filters
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");

  // debounce text inputs so we don't spam the API as the user types
  const dName = useDebounced(name);
  const dSku = useDebounced(sku);

  // data state (Spring Page shape)
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // refetch on params change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetchProducts({ pageNo, pageSize, sortBy, sortDir, name: dName, sku: dSku })
      .then((p) => {
        if (!cancelled) setPage(p);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [pageNo, pageSize, sortBy, sortDir, dName, dSku]);

  // derived
  const totalPages = page?.totalPages ?? 0;
  const totalElements = page?.totalElements ?? 0;
  const currentPage = useMemo(() => {
    // Spring Page has 0-based "number"; but our server param pageNo is 1-based.
    if (typeof page?.number === "number") return page.number + 1;
    return pageNo; // fallback
  }, [page, pageNo]);

  const items = page?.content ?? [];

  // pagination helpers
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  function goFirst() { if (canPrev) setPageNo(1); }
  function goPrev() { if (canPrev) setPageNo((p) => Math.max(1, p - 1)); }
  function goNext() { if (canNext) setPageNo((p) => Math.min(totalPages || p + 1, p + 1)); }
  function goLast() { if (canNext) setPageNo(totalPages || 1); }

  const [jump, setJump] = useState("");
  function doJump() {
    const n = Number(jump);
    if (!Number.isFinite(n)) return;
    if (n >= 1 && n <= (totalPages || 1)) setPageNo(n);
  }

  // when filters/sort change, reset to first page
  useEffect(() => { setPageNo(1); }, [pageSize, sortBy, sortDir, dName, dSku]);

  // simple styles
  const s = {
    page: { padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" },
    row: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, alignItems: "center" },
    input: { padding: 8, border: "1px solid #ddd", borderRadius: 6, minWidth: 160 },
    select: { padding: 8, border: "1px solid #ddd", borderRadius: 6 },
    btn: { padding: "8px 12px", border: "1px solid #ccc", borderRadius: 8, cursor: "pointer" },
    btnPrimary: { padding: "8px 12px", border: "1px solid #0a7", borderRadius: 8, cursor: "pointer" },
    btnDisabled: { opacity: 0.5, cursor: "not-allowed" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", borderBottom: "1px solid #e5e5e5", padding: "10px 8px" },
    td: { borderBottom: "1px solid #f0f0f0", padding: "10px 8px", verticalAlign: "top" },
    footer: { display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between", marginTop: 12, flexWrap: "wrap" },
    hr: { border: 0, borderTop: "1px solid #eee", margin: "12px 0" }
  };

  return (
    <div style={s.page}>
      <h1>Products</h1>

      {/* Filters */}
      <div style={s.row}>
        <input
          style={s.input}
          placeholder="Search name…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          style={s.input}
          placeholder="Search SKU…"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
        />
        <select style={s.select} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="createdAt">Created At</option>
          <option value="updatedAt">Updated At</option>
          <option value="price">Price</option>
        </select>
        <select style={s.select} value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
        <select style={s.select} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
          {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
        </select>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && (
        <>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>ID</th>
                <th style={s.th}>SKU</th>
                <th style={s.th}>Name</th>
                <th style={s.th}>Description</th>
                <th style={s.th}>Price</th>
                <th style={s.th}>Created</th>
                <th style={s.th}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td style={s.td}>{p.id}</td>
                  <td style={s.td}>{p.sku}</td>
                  <td style={s.td}>{p.name}</td>
                  <td style={s.td}>
                    <div style={{ maxWidth: 520, whiteSpace: "pre-wrap" }}>{p.description}</div>
                  </td>
                  <td style={s.td}>{p.price}</td>
                  <td style={s.td}>{p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}</td>
                  <td style={s.td}>{p.updatedAt ? new Date(p.updatedAt).toLocaleString() : ""}</td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td style={s.td} colSpan={7}>No products found.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div style={s.footer}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button style={{ ...s.btn, ...(canPrev ? {} : s.btnDisabled) }} disabled={!canPrev} onClick={goFirst}>
                « First
              </button>
              <button style={{ ...s.btn, ...(canPrev ? {} : s.btnDisabled) }} disabled={!canPrev} onClick={goPrev}>
                ‹ Previous
              </button>
              <span>
                Page <strong>{currentPage || 1}</strong> of <strong>{totalPages || 1}</strong>
              </span>
              <button style={{ ...s.btn, ...(canNext ? {} : s.btnDisabled) }} disabled={!canNext} onClick={goNext}>
                Next ›
              </button>
              <button style={{ ...s.btn, ...(canNext ? {} : s.btnDisabled) }} disabled={!canNext} onClick={goLast}>
                Last »
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label>Jump to:</label>
              <input
                style={{ ...s.input, width: 80, minWidth: 80 }}
                type="number"
                min={1}
                max={totalPages || 1}
                value={jump}
                onChange={(e) => setJump(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") doJump(); }}
              />
              <button style={s.btn} onClick={doJump}>Go</button>
            </div>
          </div>

          <div style={{ marginTop: 4, opacity: 0.8 }}>
            Showing <strong>{items.length}</strong> of <strong>{totalElements}</strong>
          </div>
        </>
      )}
    </div>
  );
}
