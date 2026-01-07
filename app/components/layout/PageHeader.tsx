export function PageHeader({
    title,
    action,
}: {
    title: string
    action?: React.ReactNode
}) {
    return (
        <header
            className="
        sticky top-0 z-20
        bg-background-light/90 dark:bg-background-dark/90
        backdrop-blur border-b
        border-slate-200 dark:border-slate-800
      "
        >
            <div className="h-14 flex items-center justify-between px-4 sm:px-6">
                <h1 className="text-lg sm:text-xl font-bold">{title}</h1>
                {action}
            </div>
        </header>
    )
}
