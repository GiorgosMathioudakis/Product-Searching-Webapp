// Minimal pagination: Prev / Page N / Next
export default function Pagination({
    currentPage,
    canPrev,
    canNext,
    onFirst = () => { },
    onPrev = () => { },
    onNext = () => { },
}) {
    const btnBase =
        "px-3 py-2 rounded-lg border text-sm transition disabled:opacity-50 disabled:cursor-not-allowed";
    const btn = `${btnBase} border-gray-300 bg-gray-50 hover:bg-gray-100`;

    return (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <button className={btn} disabled={!canPrev} onClick={onFirst}>
                « First
            </button>
            <button className={btn} disabled={!canPrev} onClick={onPrev}>
                ‹ Previous
            </button>

            <span className="text-sm">
                Page <strong>{currentPage || 1}</strong>
            </span>

            <button className={btn} disabled={!canNext} onClick={onNext}>
                Next ›
            </button>
        </div>
    );
}
