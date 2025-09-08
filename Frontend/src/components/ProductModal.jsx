import { useState } from "react";

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

export default function ProductModal({ open, mode, initial, onClose, onSubmit }) {
    const emptyForm = { id: null, name: "", sku: "", description: "", price: "" };
    const [form, setForm] = useState(initial || emptyForm);
    const [formErr, setFormErr] = useState({});


    // whenever initial changes (edit different row), sync state
    if (open && initial && form.id !== initial.id) {
        // naive sync without useEffect to avoid extra imports
        // eslint-disable-next-line react/no-direct-mutation-state
        setForm(initial);
        setFormErr({});
    }


    const btnBase = "px-3 py-2 rounded-lg border text-sm transition disabled:opacity-50 disabled:cursor-not-allowed";
    const btn = `${btnBase} border-gray-300 bg-gray-50 hover:bg-gray-100`;
    const btnPrimary = `${btnBase} border-emerald-600 bg-emerald-500 text-white hover:bg-emerald-600`;


    if (!open) return null;


    const handleSave = async (e) => {
        e?.preventDefault?.();
        const errs = validateForm(form);
        setFormErr(errs);
        if (Object.keys(errs).length) return;


        const payload = {
            name: form.name.trim(),
            sku: form.sku.trim(),
            description: form.description?.trim() || "",
            price: Number(form.price),
        };


        try {
            await onSubmit({ mode, id: form.id, payload });
            onClose();
        } catch (err) {
            const msg = String(err);
            if (/sku/i.test(msg) && /exist|unique|duplicate/i.test(msg)) {
                setFormErr((fe) => ({ ...fe, sku: "SKU must be unique" }));
            } else {
                alert(msg);
            }
        }
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div className="relative z-10 w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
                <h2 className="mb-2 text-lg font-semibold">{mode === "create" ? "Create Product" : "Edit Product"}</h2>
                <form className="space-y-3" onSubmit={handleSave}>
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        />
                        {formErr.name && <p className="mt-1 text-xs text-red-600">{formErr.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">SKU</label>
                        <input
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                            value={form.sku}
                            onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                        />
                        {formErr.sku && <p className="mt-1 text-xs text-red-600">{formErr.sku}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Description</label>
                        <textarea
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                            rows={4}
                            value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        />
                        {formErr.description && <p className="mt-1 text-xs text-red-600">{formErr.description}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Price</label>
                        <input
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                            type="number"
                            step="0.01"
                            min={0}
                            required
                            value={form.price}
                            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                        />
                        {formErr.price && <p className="mt-1 text-xs text-red-600">{formErr.price}</p>}
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <button type="button" className={btn} onClick={onClose}>Cancel</button>
                        <button type="submit" className={btnPrimary}>{mode === "create" ? "Create" : "Apply"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}