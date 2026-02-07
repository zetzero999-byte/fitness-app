import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'แอพออกกำลังกาย',
  description: 'แอพออกกำลังกายง่ายๆ พร้อมติดตามความก้าวหน้า',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
