import { useEffect, useMemo, useState } from "react";
import { fetchProducts } from "../api/product";


/**
* Fetches Spring Page<Product> whenever params change.
* Returns { page, items, loading, error, currentPage, totalPages, totalElements, refetch }
*/
export default function useProducts(params) {
    const { pageNo } = params;
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        fetchProducts(params)
            .then((p) => { if (!cancelled) setPage(p); })
            .catch((e) => { if (!cancelled) setError(String(e)); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [params.pageNo, params.pageSize, params.sortBy, params.sortDir, params.name, params.sku]);


    const totalPages = page?.totalPages ?? 0;
    const totalElements = page?.totalElements ?? 0;
    const currentPage = useMemo(() => (
        typeof page?.number === "number" ? page.number + 1 : pageNo
    ), [page, pageNo]);


    const items = page?.content ?? [];


    const refetch = () => fetchProducts(params).then(setPage).catch((e) => setError(String(e)));


    return { page, items, loading, error, currentPage, totalPages, totalElements, refetch };
}