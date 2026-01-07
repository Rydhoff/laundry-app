import React from "react"

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className="
        h-12 w-full rounded-lg
        border border-slate-200 dark:border-slate-700
        bg-white dark:bg-slate-800
        px-4 text-sm
        focus:ring-2 focus:ring-primary/40
        focus:border-primary
      "
        />
    )
}
