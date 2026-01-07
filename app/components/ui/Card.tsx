export default function Card({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="
        bg-card rounded-xl shadow-card
        p-4
        lg:p-5
      "
        >
            {children}
        </div>
    )
}
