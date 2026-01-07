export function Sidebar() {
    return (
        <aside className="hidden lg:flex lg:w-64 border-r bg-white dark:bg-slate-900">
            <div className="p-4 space-y-2 w-full">
                <SidebarItem label="Dashboard" />
                <SidebarItem label="Orders" />
                <SidebarItem label="Services" />
            </div>
        </aside>
    )
}

function SidebarItem({ label }: { label: string }) {
    return (
        <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            {label}
        </button>
    )
}
