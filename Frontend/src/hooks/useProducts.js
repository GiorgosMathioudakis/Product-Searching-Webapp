import { useEffect, useMemo, useState } from "react";
import { fetchProductsPage, fetchProductsSlice } from "../api/product";

// mode: 'page' | 'slice'
export default function useProducts(params, mode = "page") {
    const { pageNo, pageSize, sortBy, sortDir, name, sku } = params;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");

        const fetcher = mode === "slice" ? fetchProductsSlice : fetchProductsPage;

        fetcher({ pageNo, pageSize, sortBy, sortDir, name, sku })
            .then((resp) => { if (!cancelled) setData(resp); })
            .catch((e) => { if (!cancelled) setError(String(e)); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [pageNo, pageSize, sortBy, sortDir, name, sku, mode]);

    const items = data?.content ?? [];

    let currentPage, totalPages, totalElements, hasPrev, hasNext;

    if (mode === "slice") {
        // Slice payload may or may not include hasNext — be robust:
        const serverHasNext = typeof data?.hasNext === "boolean" ? data.hasNext : null;

        currentPage = data?.pageNo ?? pageNo;
        totalPages = null;     // not available
        totalElements = null;     // not available
        hasPrev = (currentPage || 1) > 1;
        // Fallback heuristic: if we got a full page, assume there *might* be a next page
        hasNext = serverHasNext ?? (items.length === pageSize);
    } else {
        totalPages = data?.totalPages ?? 0;
        totalElements = data?.totalElements ?? 0;
        currentPage = useMemo(
            () => (typeof data?.number === "number" ? data.number + 1 : pageNo),
            [data, pageNo]
        );
        hasPrev = (currentPage || 1) > 1;
        hasNext = (currentPage || 1) < (totalPages || 1);
    }

    const refetch = async () => {
        const fetcher = mode === "slice" ? fetchProductsSlice : fetchProductsPage;
        try {
            const resp = await fetcher({ pageNo, pageSize, sortBy, sortDir, name, sku });
            setData(resp);
        } catch (e) {
            setError(String(e));
        }
    };

    return {
        items,
        loading,
        error,
        currentPage,
        totalPages,
        totalElements,
        hasPrev,
        hasNext,
        refetch,
    };
}
