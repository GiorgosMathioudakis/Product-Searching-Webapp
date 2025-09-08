export default function Pagination({
    currentPage,
    totalPages,
    itemsShown,
    totalElements,
    canPrev,
    canNext,
    onFirst,
    onPrev,
    onNext,
    onLast,
    jump,
    setJump,
    onJump,
}) {
    const btnBase = "px-3 py-2 rounded-lg border text-sm transition disabled:opacity-50 disabled:cursor-not-allowed";
    const btn = `${btnBase} border-gray-300 bg-gray-50 hover:bg-gray-100`;


    return (
        <>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <button className={btn} disabled={!canPrev} onClick={onFirst}>« First</button>
                    <button className={btn} disabled={!canPrev} onClick={onPrev}>‹ Previous</button>
                    <span className="text-sm">Page <strong>{currentPage || 1}</strong> of <strong>{totalPages || 1}</strong></span>
                    <button className={btn} disabled={!canNext} onClick={onNext}>Next ›</button>
                    <button className={btn} disabled={!canNext} onClick={onLast}>Last »</button>
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
                        onKeyDown={(e) => { if (e.key === "Enter") onJump(); }}
                    />
                    <button className={btn} onClick={onJump}>Go</button>
                </div>
            </div>
            <div className="mt-1 text-sm text-gray-600">Showing <strong>{itemsShown}</strong> of <strong>{totalElements}</strong></div>
        </>
    );
}