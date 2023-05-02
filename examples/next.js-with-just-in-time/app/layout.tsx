import { CSSProvider } from '@master/css.react'
import './globals.css'

export const metadata = {
    title: 'Create Next App',
    description: 'Generated by create next app',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <CSSProvider>
                {children}
            </CSSProvider>
        </html>
    )
}