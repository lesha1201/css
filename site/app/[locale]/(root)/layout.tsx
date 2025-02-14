import '../../globals.css'
import { Locale } from 'shared/i18n.config'
import RootLayout from '../root.layout'

export default async function Layout(props: {
    children: JSX.Element,
    params: { locale: Locale }
}) {
    return (
        // @ts-expect-error server component
        <RootLayout {...props} bodyAttrs={{ className: 'bg:base' }} />
    )
}
