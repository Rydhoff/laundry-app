'use client'

import { QRCodeCanvas } from 'qrcode.react'

export default function NotaQRCode({ value }: { value: string }) {
    return (
        <div className="flex flex-col items-center gap-2 pt-4">
            <QRCodeCanvas
                value={value}
                size={140}
                bgColor="#ffffff"
                fgColor="#000000"
                level="M"
                includeMargin
            />
        </div>
    )
}
