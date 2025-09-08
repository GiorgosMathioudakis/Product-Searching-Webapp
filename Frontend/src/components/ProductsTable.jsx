export default function ProductsTable({ items, onEdit, onDelete }) {
    const btnBase = "px-3 py-2 rounded-lg border text-sm transition disabled:opacity-50 disabled:cursor-not-allowed";
    const btn = `${btnBase} border-gray-300 bg-gray-50 hover:bg-gray-100`;
    const btnDanger = `${btnBase} border-red-300 bg-red-50 text-red-700 hover:bg-red-100`;

    const thPrimary = "border-b border-gray-200 px-3 py-2";
    const tdPrimary = "border-b border-gray-100 px-3 py-2 align-top";

    return (
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-gray-50 text-left">
                        <th className={thPrimary} >Name</th>
                        <th className={thPrimary} >SKU</th>
                        <th className={thPrimary} >Description</th>
                        <th className={thPrimary} >Price</th>
                        <th className={thPrimary} >Created</th>
                        <th className={thPrimary} >Updated</th>
                        <th className={thPrimary} >Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((p) => (
                        <tr key={p.id} className="odd:bg-white even:bg-gray-50">
                            <td className={tdPrimary} >{p.name}</td>
                            <td className={tdPrimary} >{p.sku}</td>
                            <td className={tdPrimary} ><div className="max-w-[36rem] whitespace-pre-wrap">{p.description}</div></td>
                            <td className={tdPrimary} >{p.price}</td>
                            <td className={tdPrimary} >{p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}</td>
                            <td className={tdPrimary} >{p.updatedAt ? new Date(p.updatedAt).toLocaleString() : ""}</td>
                            <td className="border-b border-gray-100 px-3 py-2 align-top text-right">
                                <div className="flex justify-end gap-2">
                                    <button className={btn} onClick={() => onEdit(p)}>Edit</button>
                                    <button className={btnDanger} onClick={() => onDelete(p)}>Delete</button>
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
    );
}