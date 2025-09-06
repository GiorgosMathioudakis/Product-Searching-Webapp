import { useEffect, useMemo, useState } from "react";

// --- Utilities --------------------------------------------------------------
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

// --- App (TailwindCSS) ------------------------------------------------------
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
        if (!cancelled) setError(String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
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

  function goFirst() {
    if (canPrev) setPageNo(1);
  }
  function goPrev() {
    if (canPrev) setPageNo((p) => Math.max(1, p - 1));
  }
  function goNext() {
    if (canNext) setPageNo((p) => Math.min(totalPages || p + 1, p + 1));
  }
  function goLast() {
    if (canNext) setPageNo(totalPages || 1);
  }

  const [jump, setJump] = useState("");
  function doJump() {
    const n = Number(jump);
    if (!Number.isFinite(n)) return;
    if (n >= 1 && n <= (totalPages || 1)) setPageNo(n);
  }

  // when filters/sort change, reset to first page
  useEffect(() => {
    setPageNo(1);
  }, [pageSize, sortBy, sortDir, dName, dSku]);

  const btnBase =
    "px-3 py-2 rounded-lg border text-sm transition disabled:opacity-50 disabled:cursor-not-allowed";
  const btn = `${btnBase} border-gray-300 bg-gray-50 hover:bg-gray-100`;

  return (
    <div className="p-6 font-sans">
      <h1 className="text-2xl font-semibold tracking-tight">Products</h1>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          className="min-w-[12rem] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          placeholder="Search name…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="min-w-[12rem] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          placeholder="Search SKU…"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
        />
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="createdAt">Created At</option>
          <option value="updatedAt">Updated At</option>
          <option value="price">Price</option>
          <option value="name">Name</option>
          <option value="sku">SKU</option>
        </select>
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={sortDir}
          onChange={(e) => setSortDir(e.target.value)}
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="mt-4 text-sm text-gray-600">Loading…</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="border-b border-gray-200 px-3 py-2">ID</th>
                  <th className="border-b border-gray-200 px-3 py-2">SKU</th>
                  <th className="border-b border-gray-200 px-3 py-2">Name</th>
                  <th className="border-b border-gray-200 px-3 py-2">Description</th>
                  <th className="border-b border-gray-200 px-3 py-2">Price</th>
                  <th className="border-b border-gray-200 px-3 py-2">Created</th>
                  <th className="border-b border-gray-200 px-3 py-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="odd:bg-white even:bg-gray-50">
                    <td className="border-b border-gray-100 px-3 py-2 align-top">{p.id}</td>
                    <td className="border-b border-gray-100 px-3 py-2 align-top">{p.sku}</td>
                    <td className="border-b border-gray-100 px-3 py-2 align-top">{p.name}</td>
                    <td className="border-b border-gray-100 px-3 py-2 align-top">
                      <div className="max-w-[36rem] whitespace-pre-wrap">{p.description}</div>
                    </td>
                    <td className="border-b border-gray-100 px-3 py-2 align-top">{p.price}</td>
                    <td className="border-b border-gray-100 px-3 py-2 align-top">{p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}</td>
                    <td className="border-b border-gray-100 px-3 py-2 align-top">{p.updatedAt ? new Date(p.updatedAt).toLocaleString() : ""}</td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td className="px-3 py-3" colSpan={7}>
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button className={btn} disabled={!canPrev} onClick={goFirst}>
                « First
              </button>
              <button className={btn} disabled={!canPrev} onClick={goPrev}>
                ‹ Previous
              </button>
              <span className="text-sm">
                Page <strong>{currentPage || 1}</strong> of <strong>{totalPages || 1}</strong>
              </span>
              <button className={btn} disabled={!canNext} onClick={goNext}>
                Next ›
              </button>
              <button className={btn} disabled={!canNext} onClick={goLast}>
                Last »
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Jump to:</label>
              <input
                className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                type="number"
                min={1}
                max={totalPages || 1}
                value={jump}
                onChange={(e) => setJump(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") doJump();
                }}
              />
              <button className={btn} onClick={doJump}>
                Go
              </button>
            </div>
          </div>

          <div className="mt-1 text-sm text-gray-600">
            Showing <strong>{items.length}</strong> of <strong>{totalElements}</strong>
          </div>
        </>
      )}
    </div>
  );
}
