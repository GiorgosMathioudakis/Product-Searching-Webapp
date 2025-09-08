export default function ProductsTable({ items, onEdit, onDelete }) {
    const btnBase = "px-3 py-2 rounded-lg border text-sm transition disabled:opacity-50 disabled:cursor-not-allowed";
    const btn = `${btnBase} border-gray-300 bg-gray-50 hover:bg-gray-100`;
    const btnDanger = `${btnBase} border-red-300 bg-red-50 text-red-700 hover:bg-red-100`;


    return (
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-gray-50 text-left">
                        <th className="border-b border-gray-200 px-3 py-2">Name</th>
                        <th className="border-b border-gray-200 px-3 py-2">SKU</th>
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
                            <td className="border-b border-gray-100 px-3 py-2 align-top">{p.name}</td>
                            <td className="border-b border-gray-100 px-3 py-2 align-top">{p.sku}</td>
                            <td className="border-b border-gray-100 px-3 py-2 align-top"><div className="max-w-[36rem] whitespace-pre-wrap">{p.description}</div></td>
                            <td className="border-b border-gray-100 px-3 py-2 align-top">{p.price}</td>
                            <td className="border-b border-gray-100 px-3 py-2 align-top">{p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}</td>
                            <td className="border-b border-gray-100 px-3 py-2 align-top">{p.updatedAt ? new Date(p.updatedAt).toLocaleString() : ""}</td>
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