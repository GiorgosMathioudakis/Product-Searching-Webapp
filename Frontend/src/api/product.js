import { buildQuery } from "../utils/query";

export async function fetchProductsPage({ pageNo, pageSize, sortBy, sortDir, name, sku }) {
    const qs = buildQuery({ pageNo, pageSize, sortBy, sortDir, name, sku });
    const res = await fetch(`/api/products?${qs}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json(); // Spring Page<Product>
}

export async function fetchProductsSlice({ pageNo, pageSize, sortBy, sortDir, name, sku }) {
    const qs = buildQuery({ pageNo, pageSize, sortBy, sortDir, name, sku });
    const res = await fetch(`/api/products/slice?${qs}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json(); // { content, pageNo, pageSize, hasNext?, hasPrev? }
}


export async function apiCreate(body) {
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


export async function apiUpdate(id, body) {
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


export async function apiDelete(id) {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
    }
}