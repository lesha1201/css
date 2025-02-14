import { Viewport } from 'next';
import i18n from 'shared/i18n.config.mjs'

export const metadata = {
    metadataBase: new URL(`https://${process.env.HOST}`),
    title: {
        template: '%s - Master CSS',
        default: 'Master CSS'
    }
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover',
    userScalable: true
}

export async function generateStaticParams() {
    return i18n.locales.map((locale: any) => ({ locale }));
}

export default async function RootLayout({
    children
}: {
    children: JSX.Element
}) {
    return children
}
