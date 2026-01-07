export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background flex justify-center">
            {/* Container utama */}
            <div
                className="
          w-full
          max-w-md           /* mobile */
          lg:max-w-6xl       /* desktop */
          lg:px-6
        "
            >
                {children}
            </div>
        </div>
    )
}
