export default function DesktopNav() {
    return (
        <nav className="hidden lg:flex gap-6 text-sm font-medium">
            <NavItem active label="Dashboard" />
            <NavItem label="Orders" />
            <NavItem label="Services" />
            <NavItem label="Customers" />
        </nav>
    )
}

function NavItem({
    label,
    active,
}: {
    label: string
    active?: boolean
}) {
    return (
        <span
            className={
                active
                    ? "text-primary"
                    : "text-muted hover:text-slate-900"
            }
        >
            {label}
        </span>
    )
}
