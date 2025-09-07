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

  // CRUD modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const emptyForm = { id: null, name: "", sku: "", description: "", price: "" };
  const [form, setForm] = useState(emptyForm);
  const [formErr, setFormErr] = useState({});

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

  const btnBase = "px-3 py-2 rounded-lg border text-sm transition disabled:opacity-50 disabled:cursor-not-allowed";
  const btn = `${btnBase} border-gray-300 bg-gray-50 hover:bg-gray-100`;
  const btnPrimary = `${btnBase} border-emerald-600 bg-emerald-500 text-white hover:bg-emerald-600`;

  // ------------------- CRUD Helpers -------------------
  const PRICE_MAX = 999999999999.99; // UI guard; server should enforce as well
  const LEN = { name: 255, sku: 255, description: 500 };

  function validateForm(f) {
    const errs = {};
    if (!f.name?.trim()) errs.name = "Name is required";
    if (!f.sku?.trim()) errs.sku = "SKU is required";
    if (String(f.name).length > LEN.name) errs.name = `Max ${LEN.name} chars`;
    if (String(f.sku).length > LEN.sku) errs.sku = `Max ${LEN.sku} chars`;
    if (String(f.description || "").length > LEN.description) errs.description = `Max ${LEN.description} chars`;

    if (f.sku && !/^[A-Za-z0-9]+$/.test(f.sku)) {
      errs.sku = "SKU may only contain letters and numbers";
    }

    if (f.price === "" || f.price === null || f.price === undefined) {
      errs.price = "Price is required";
    } else {
      const priceNum = Number(f.price);
      if (Number.isNaN(priceNum)) errs.price = "Price must be a number";
      else if (priceNum < 0) errs.price = "Price must be ≥ 0";
      else if (priceNum > PRICE_MAX) errs.price = `Price must be ≤ ${PRICE_MAX}`;
    }

    return errs;
  }

  function openCreate() {
    setModalMode("create");
    setForm(emptyForm);
    setFormErr({});
    setModalOpen(true);
  }

  function openEdit(p) {
    setModalMode("edit");
    setForm({ id: p.id, name: p.name || "", sku: p.sku || "", description: p.description || "", price: String(p.price ?? "") });
    setFormErr({});
    setModalOpen(true);
  }

  async function apiCreate(body) {
    const res = await fetch(`/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
  }

  async function apiUpdate(id, body) {
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
  }

  async function apiDelete(id) {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
  }

  async function handleSave(e) {
    e?.preventDefault?.();
    const errs = validateForm(form);
    setFormErr(errs);
    if (Object.keys(errs).length) return;

    // prepare payload
    const payload = { name: form.name.trim(), sku: form.sku.trim(), description: form.description?.trim() || "", price: Number(form.price) };

    try {
      if (modalMode === "create") await apiCreate(payload);
      else await apiUpdate(form.id, payload);
      setModalOpen(false);
      // refetch current page
      fetchProducts({ pageNo, pageSize, sortBy, sortDir, name: dName, sku: dSku }).then(setPage);
    } catch (err) {
      const msg = String(err);
      // naive duplicate SKU detection (server should send 409 with message)
      if (/sku/i.test(msg) && /exist|unique|duplicate/i.test(msg)) {
        setFormErr((fe) => ({ ...fe, sku: "SKU must be unique" }));
      } else {
        alert(msg);
      }
    }
  }

  async function handleDelete(p) {
    if (!window.confirm(`Delete product "${p.name}" (SKU ${p.sku})?`)) return;
    try {
      await apiDelete(p.id);
      // If we deleted the last item on the last page, consider nudging one page back
      const willBeEmpty = items.length === 1 && currentPage === totalPages && currentPage > 1;
      if (willBeEmpty) setPageNo(currentPage - 1);
      else {
        // refetch
        fetchProducts({ pageNo, pageSize, sortBy, sortDir, name: dName, sku: dSku }).then(setPage);
      }
    } catch (err) {
      alert(String(err));
    }
  }

  return (
    <div className="p-6 font-sans">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <button className={btnPrimary} onClick={openCreate}>+ New Product</button>
      </div>

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
        <select className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="createdAt">Created At</option>
          <option value="updatedAt">Updated At</option>
          <option value="price">Price</option>
          <option value="name">Name</option>
          <option value="sku">SKU</option>
        </select>
        <select className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
        <select className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>{n} / page</option>
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
                  <th className="border-b border-gray-200 px-3 py-2">SKU</th>
                  <th className="border-b border-gray-200 px-3 py-2">Name</th>
                  <th className="border-b border-gray-200 px-3 py-2">Description</th>
                  <th className="border-b border-gray-200 px-3 py-2">Price</th>
                  <th className="border-b border-gray-200 px-3 py-2">Created</th>
                  <th className="border-b border-gray-200 px-3 py-2">Updated</th>
                  <th className="border-b border-gray-200 px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="odd:bg-white even:bg-gray-50">
                    <td className="border-b border-gray-100 px-3 py-2 align-top">{p.sku}</td>
                    <td className="border-b border-gray-100 px-3 py-2 align-top">{p.name}</td>
                    <td className="border-b border-gray-100 px-3 py-2 align-top"><div className="max-w-[36rem] whitespace-pre-wrap">{p.description}</div></td>
                    <td className="border-b border-gray-100 px-3 py-2 align-top">{p.price}</td>
                    <td className="border-b border-gray-100 px-3 py-2 align-top">{p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}</td>
                    <td className="border-b border-gray-100 px-3 py-2 align-top">{p.updatedAt ? new Date(p.updatedAt).toLocaleString() : ""}</td>
                    <td className="border-b border-gray-100 px-3 py-2 align-top text-right">
                      <div className="flex justify-end gap-2">
                        <button className={btn} onClick={() => openEdit(p)}>Edit</button>
                        <button className={`${btnBase} border-red-300 bg-red-50 text-red-700 hover:bg-red-100`} onClick={() => handleDelete(p)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td className="px-3 py-3" colSpan={7}>No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button className={btn} disabled={!canPrev} onClick={goFirst}>« First</button>
              <button className={btn} disabled={!canPrev} onClick={goPrev}>‹ Previous</button>
              <span className="text-sm">Page <strong>{currentPage || 1}</strong> of <strong>{totalPages || 1}</strong></span>
              <button className={btn} disabled={!canNext} onClick={goNext}>Next ›</button>
              <button className={btn} disabled={!canNext} onClick={goLast}>Last »</button>
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
                onKeyDown={(e) => { if (e.key === "Enter") doJump(); }}
              />
              <button className={btn} onClick={doJump}>Go</button>
            </div>
          </div>

          <div className="mt-1 text-sm text-gray-600">Showing <strong>{items.length}</strong> of <strong>{totalElements}</strong></div>
        </>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
            <h2 className="mb-2 text-lg font-semibold">{modalMode === "create" ? "Create Product" : "Edit Product"}</h2>
            <form className="space-y-3" onSubmit={handleSave}>
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                {formErr.name && <p className="mt-1 text-xs text-red-600">{formErr.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">SKU</label>
                <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
                {formErr.sku && <p className="mt-1 text-xs text-red-600">{formErr.sku}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                {formErr.description && <p className="mt-1 text-xs text-red-600">{formErr.description}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">Price</label>
                <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" type="number" step="0.01" min={0} required value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
                {formErr.price && <p className="mt-1 text-xs text-red-600">{formErr.price}</p>}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" className={btn} onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className={btnPrimary}>{modalMode === "create" ? "Create" : "Apply"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
