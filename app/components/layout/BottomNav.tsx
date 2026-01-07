export default function BottomNav() {
    return (
        <nav
            className="
        fixed bottom-0
        w-full max-w-md
        bg-white border-t
        lg:hidden
      "
        >
            <div className="h-14 flex justify-around items-center text-xs">
                <NavItem active label="Home" />
                <NavItem label="Orders" />
                <NavItem label="Customers" />
                <NavItem label="Profile" />
            </div>
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
                    ? "text-primary font-medium"
                    : "text-muted"
            }
        >
            {label}
        </span>
    )
}
