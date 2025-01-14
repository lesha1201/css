import { getPreInitScript } from 'theme-service'
import { Locale } from 'shared/i18n.config'
import { l } from 'to-line'
import { RedirectsProvider } from 'shared/contexts/redirects'
import redirects from '~/redirects.mjs'
import { Analytics } from '@vercel/analytics/react'
import config from 'shared/master.css'
import CSSProvider from '@master/css.react/CSSProvider'
import ThemeServiceProvider from '@master/css.react/ThemeServiceProvider'

export default async function RootLayout({
    children,
    params,
    bodyAttrs
}: {
    children: JSX.Element,
    params: { locale: Locale },
    bodyAttrs?: any
}) {
    return (
        <html lang={params.locale} style={process.env.NODE_ENV === 'development' ? { display: 'none' } : undefined}>
            <head>
                <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="any" />
                <script dangerouslySetInnerHTML={{ __html: getPreInitScript({ default: 'system' }) }}></script>
                {params.locale === 'tw' &&
                    <>
                        <link rel="preconnect" href="https://fonts.googleapis.com" />
                        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin='' />
                        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap" rel="stylesheet" />
                    </>
                }
                {/* <script dangerouslySetInnerHTML={{ __html: `
                    document.addEventListener('DOMContentLoaded', () => {
                        const sidebar = document.getElementById('sidebar');
                        if (sidebar) {
                            const activeNav = sidebar.querySelector('.active');
                            console.log(activeNav)
                            console.log(sidebar.scrollTop)
                            if (activeNav) {
                                const activeNavRect = activeNav.getBoundingClientRect()
                                setTimeout(() => {
                                    sidebar.scrollTop = 200;
                                    console.log('fuck');
                                }, 1000)
                            }
                        }
                    })
                `}}></script> */}
            </head>
            <body {...bodyAttrs} className={l(bodyAttrs?.className, 'font:sans font:mono_:where(code,kbd,samp) overflow:hidden|overlay fg:neutral bg:slate-50/.2_:where(::selection)')}>
                <ThemeServiceProvider options={{ default: 'system' }}>
                    <CSSProvider config={config}>
                        <RedirectsProvider value={redirects}>
                            {children}
                        </RedirectsProvider>
                    </CSSProvider>
                </ThemeServiceProvider>
                <Analytics />
            </body>
        </html>
    )
}
