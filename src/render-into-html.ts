import { StyleSheet as MasterCSSStyleSheet, renderFromHTML } from '.'
import './polyfills/css-escape'

export function renderIntoHTML(html: string, StyleSheet: typeof MasterCSSStyleSheet = MasterCSSStyleSheet): string {
    if (!html) return;
    return html
        .replace(/(<head>)/, `$1<style id="master-css">${renderFromHTML(html, StyleSheet)}</style>`)
}