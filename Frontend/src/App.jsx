import { useEffect, useMemo, useState } from "react";
import useDebounced from "./hooks/useDebounced";
import useProducts from "./hooks/useProducts";
import { apiCreate, apiDelete, apiUpdate } from "./api/product";
import Filters from "./components/filters";
import Pagination from "./components/Pagination";
import ProductsTable from "./components/ProductsTable";
import ProductModal from "./components/ProductModal";


export default function App() {

  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  // filters
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");

  const dName = useDebounced(name);
  const dSku = useDebounced(sku);


  const { items, loading, error, currentPage, totalPages, totalElements, refetch } = useProducts({
    pageNo,
    pageSize,
    sortBy,
    sortDir,
    name: dName,
    sku: dSku,
  });

  // when filters/sort change, reset to first page
  useEffect(() => { setPageNo(1); }, [pageSize, sortBy, sortDir, dName, dSku]);

  // pagination helpers
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;
  const goFirst = () => { if (canPrev) setPageNo(1); };
  const goPrev = () => { if (canPrev) setPageNo((p) => Math.max(1, p - 1)); };
  const goNext = () => { if (canNext) setPageNo((p) => Math.min(totalPages || p + 1, p + 1)); };
  const goLast = () => { if (canNext) setPageNo(totalPages || 1); };


  const [jump, setJump] = useState("");
  const doJump = () => {
    const n = Number(jump);
    if (!Number.isFinite(n)) return;
    if (n >= 1 && n <= (totalPages || 1)) setPageNo(n);
  };

  // CRUD modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' OR 'edit'
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
    const willBeEmpty = items.length === 1 && currentPage === totalPages && currentPage > 1;
    if (willBeEmpty) setPageNo(currentPage - 1);
    else await refetch();
  };

  const btnPrimary = "px-3 py-2 rounded-lg border text-sm transition disabled:opacity-50 disabled:cursor-not-allowed border-emerald-600 bg-emerald-500 text-white hover:bg-emerald-600";

  return (
    <div className="p-6 font-sans">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <button className={btnPrimary} onClick={openCreate}>+ New Product</button>
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
            totalPages={totalPages}
            itemsShown={items.length}
            totalElements={totalElements}
            canPrev={canPrev}
            canNext={canNext}
            onFirst={goFirst}
            onPrev={goPrev}
            onNext={goNext}
            onLast={goLast}
            jump={jump}
            setJump={setJump}
            onJump={doJump}
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