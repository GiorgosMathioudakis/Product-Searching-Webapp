import { useEffect, useState } from "react";
import useDebounced from "./hooks/useDebounced";
import useProducts from "./hooks/useProducts";
import { apiCreate, apiDelete, apiUpdate } from "./api/product";
import Filters from "./components/filters";
import Pagination from "./components/Pagination";
import ProductsTable from "./components/ProductsTable";
import ProductModal from "./components/ProductModal";

export default function App() {

  const USE_SLICE = true;

  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const dName = useDebounced(name);
  const dSku = useDebounced(sku);

  const {
    items,
    loading,
    error,
    currentPage,
    hasPrev,
    hasNext,
    refetch,
  } = useProducts(
    { pageNo, pageSize, sortBy, sortDir, name: dName, sku: dSku },
    USE_SLICE ? "slice" : "page"
  );

  useEffect(() => {
    setPageNo(1);
  }, [pageSize, sortBy, sortDir, dName, dSku]);


  const goFirst = () => { if (hasPrev) setPageNo(1); };


  // CRUD modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [modalInitial, setModalInitial] = useState({ id: null, name: "", sku: "", description: "", price: "" });

  const openCreate = () => {
    setModalMode("create");
    setModalInitial({ id: null, name: "", sku: "", description: "", price: "" });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setModalMode("edit");
    setModalInitial({ id: p.id, name: p.name || "", sku: p.sku || "", description: p.description || "", price: String(p.price ?? "") });
    setModalOpen(true);
  };

  const handleSubmitModal = async ({ mode, id, payload }) => {
    if (mode === "create") await apiCreate(payload);
    else await apiUpdate(id, payload);
    await refetch();
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete product "${p.name}" (SKU ${p.sku})?`)) return;
    await apiDelete(p.id);
    await refetch();
  };

  const btnPrimary =
    "px-3 py-2 rounded-lg border text-sm transition disabled:opacity-50 disabled:cursor-not-allowed border-emerald-600 bg-emerald-500 text-white hover:bg-emerald-600";

  return (
    <div className="p-6 font-sans">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <button className={btnPrimary} onClick={openCreate}>
          + New Product
        </button>
      </div>

      <Filters
        name={name}
        sku={sku}
        sortBy={sortBy}
        sortDir={sortDir}
        pageSize={pageSize}
        onChange={(patch) => {
          if (patch.name !== undefined) setName(patch.name);
          if (patch.sku !== undefined) setSku(patch.sku);
          if (patch.sortBy !== undefined) setSortBy(patch.sortBy);
          if (patch.sortDir !== undefined) setSortDir(patch.sortDir);
          if (patch.pageSize !== undefined) setPageSize(patch.pageSize);
        }}
      />

      {loading && <p className="mt-4 text-sm text-gray-600">Loading…</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <ProductsTable items={items} onEdit={openEdit} onDelete={handleDelete} />

          <Pagination
            currentPage={currentPage}
            canPrev={hasPrev}
            canNext={hasNext}
            onFirst={goFirst}
            onPrev={() => hasPrev && setPageNo((p) => Math.max(1, p - 1))}
            onNext={() => hasNext && setPageNo((p) => p + 1)}
          />
        </>
      )}

      <ProductModal
        open={modalOpen}
        mode={modalMode}
        initial={modalInitial}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitModal}
      />
    </div>
  );
}
