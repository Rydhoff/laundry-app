import { inter } from '@/app/fonts/fonts';
import { Metadata, Viewport } from 'next';
import '@/app/globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Laundry App',
  description: 'Laundry Management App',
  manifest: '/manifest.json'
}

export const viewport: Viewport = {
  themeColor: 'white',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
