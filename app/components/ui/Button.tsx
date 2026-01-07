export default function Button({
    children,
    className = "",
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={`
        h-12
        px-6
        rounded-xl
        bg-primary text-white
        font-semibold
        flex items-center justify-center
        active:scale-95 transition
        ${className}
      `}
        >
            {children}
        </button>
    )
}
