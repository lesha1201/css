import './globals.css'
import { CSSProvider } from '@master/css.react'
import config from '../master.css'

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
        <html lang="en" style={process.env.NODE_ENV === 'development' ? { display: 'none' } : undefined}>
            <body>
                <CSSProvider config={config}>
                    {children}
                </CSSProvider>
            </body>
        </html>
    )
}
