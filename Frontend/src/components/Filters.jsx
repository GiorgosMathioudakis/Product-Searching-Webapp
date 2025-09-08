export default function Filters({ name, sku, sortBy, sortDir, pageSize, onChange }) {

    const selectPrimary = "rounded-md border border-gray-300 px-3 py-2 text-sm";
    const inputPrimary = "min-w-[12rem] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300";

    return (
        <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
                className={inputPrimary}
                placeholder="Search name…"
                value={name}
                onChange={(e) => onChange({ name: e.target.value })}
            />
            <input
                className={inputPrimary}
                placeholder="Search SKU…"
                value={sku}
                onChange={(e) => onChange({ sku: e.target.value })}
            />
            <select
                className={selectPrimary}
                value={sortBy}
                onChange={(e) => onChange({ sortBy: e.target.value })}
            >
                <option value="createdAt">Created At</option>
                <option value="updatedAt">Updated At</option>
                <option value="price">Price</option>
            </select>
            <select
                className={selectPrimary}
                value={sortDir}
                onChange={(e) => onChange({ sortDir: e.target.value })}
            >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
            </select>
            <select
                className={selectPrimary}
                value={pageSize}
                onChange={(e) => onChange({ pageSize: Number(e.target.value) })}
            >
                {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>{n} / page</option>
                ))}
            </select>
        </div>
    );
}