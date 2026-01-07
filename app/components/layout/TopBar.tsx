export default function TopBar({
    title,
    left,
    right,
}: {
    title: string
    left?: React.ReactNode
    right?: React.ReactNode
}) {
    return (
        <header
            className="
        sticky top-0 z-20
        bg-background
        border-b
      "
        >
            <div
                className="
          h-14
          px-4
          lg:px-0
          flex items-center justify-between
        "
            >
                <div className="flex items-center gap-2">
                    {left}
                    <h1 className="text-lg font-semibold">{title}</h1>
                </div>
                {right}
            </div>
        </header>
    )
}
