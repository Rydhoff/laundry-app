type Status = "Diterima" | "Diproses" | "Selesai" | "Diambil"

export function Badge({ status }: { status: Status }) {
    const styles: Record<Status, string> = {
        Diterima: "bg-gray-200 text-gray-800",
        Diproses: "bg-yellow-200 text-yellow-800",
        Selesai: "bg-green-200 text-green-800",
        Diambil: "bg-blue-200 text-blue-800",
    }

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}
        >
            {status}
        </span>
    )
}
